const Product = require('../models/Product');
const Order = require('../models/Order');

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'Valued Client';

    if (!message) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const query = message.toLowerCase();
    let reply = "";
    let recommendedProducts = [];

    // 1. Order Tracking Handler
    if (query.includes('track') || query.includes('order')) {
      if (!userId) {
        reply = "I would be delighted to assist with tracking your order. Please log in to your account first so I may retrieve your billing details.";
      } else {
        const orders = await Order.find({ user_id: userId });
        if (orders.length === 0) {
          reply = `Welcome, ${userName}. I checked your wardrobe archives but couldn't find any recent orders placed under your account. Ready to place your first order?`;
        } else {
          // Check if specific order ID is typed, e.g. "ord-2"
          const match = query.match(/ord-\d+/);
          let targetOrder = null;
          if (match) {
            targetOrder = orders.find(o => (o.id || o._id) === match[0]);
          } else {
            // Pick newest order
            orders.sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at));
            targetOrder = orders[0];
          }

          if (targetOrder) {
            const status = targetOrder.order_status;
            const orderId = targetOrder.id || targetOrder._id;
            const itemsList = targetOrder.items.map(i => `${i.quantity}x ${i.name} (${i.size}/${i.color})`).join(', ');
            
            let statusDetail = "";
            if (status === 'Confirmed') {
              statusDetail = "is being tailored and packaged at our distribution boutique. It will be dispatched shortly.";
            } else if (status === 'Shipped') {
              statusDetail = "has been handed to our express transit courier. It is currently en route to your shipping address.";
            } else if (status === 'Delivered') {
              statusDetail = "was successfully delivered to your residence. We hope the pieces complement your collection perfectly!";
            } else {
              statusDetail = `is currently marked as **${status}**.`;
            }

            reply = `Certainly, ${userName}. Your order **${orderId}** containing: _${itemsList}_ ${statusDetail} If you need anything else, just ask.`;
          } else {
            reply = `I see you have orders, but I could not find the exact order matching your search. Here are your recent order numbers: ${orders.map(o => o.id || o._id).join(', ')}.`;
          }
        }
      }
    } 
    // 2. Sizing Suggestions Handler
    else if (query.includes('size') || query.includes('height') || query.includes('weight') || query.includes('fit')) {
      // Look for height and weight in prompt
      // e.g., "5'9" or "175 cm" or "70 kg"
      let height = "";
      let weight = "";
      
      const heightMatch = query.match(/(\d+)\s*(cm|feet|foot|ft|'|\d+)/);
      const weightMatch = query.match(/(\d+)\s*(kg|lbs|pounds)/);

      if (weightMatch) weight = weightMatch[1];
      
      let suggestedSize = "M"; // Default
      
      if (weight) {
        const wtVal = parseInt(weight);
        if (wtVal < 55) suggestedSize = "S";
        else if (wtVal >= 55 && wtVal < 72) suggestedSize = "M";
        else if (wtVal >= 72 && wtVal < 88) suggestedSize = "L";
        else suggestedSize = "XL";
      }

      reply = `Based on luxury tailoring guidelines and standard silhouettes, I recommend selecting size **${suggestedSize}** for your frame. 
      This ensures a clean drape that balances mobility with structured elegance. Our cuts are modern, so size ${suggestedSize} will fit comfortably.`;
    } 
    // 3. Styling & Outfit Recommendations
    else if (query.includes('match') || query.includes('pants') || query.includes('shirt') || query.includes('style') || query.includes('outfit')) {
      // Find matching items
      const allProducts = await Product.find({ status: 'Active' });
      
      if (query.includes('shirt') || query.includes('top')) {
        // Recommend Pants
        recommendedProducts = allProducts.filter(p => p.category.toLowerCase().includes('pant') || p.category.toLowerCase().includes('chino'));
        reply = "For a high-end tailored look, I suggest pairing structured linen or cotton dress shirts with our *Nomad Tailored Chinos* in Beige or Olive. Neutral shades offer maximum versatility and reflect quiet luxury.";
      } else if (query.includes('pant') || query.includes('trousers') || query.includes('jeans')) {
        // Recommend shirts
        recommendedProducts = allProducts.filter(p => p.category.toLowerCase().includes('shirt') || p.category.toLowerCase().includes('hoodie'));
        reply = "Tapered trousers are best paired with relaxed-fit knitwear like our *Elysian Cashmere Knit Hoodie* or a crisp silk shirt. This texture contrast provides depth and casual refinement.";
      } else {
        recommendedProducts = allProducts.slice(0, 2);
        reply = "A core principle of modern styling is balancing structured tailored outer layers (like our Vanguard Charcoal Overcoat) with soft inner fabrics (like Aether Silk or Cashmere).";
      }
    } 
    // 4. Product recommendations by price or color
    else if (query.includes('show') || query.includes('find') || query.includes('search') || query.includes('hoodie') || query.includes('coat') || query.includes('chinos') || query.includes('under') || query.includes('below')) {
      const allProducts = await Product.find({ status: 'Active' });
      
      // Parse category
      let category = "";
      if (query.includes('hoodie')) category = "hoodie";
      else if (query.includes('shirt')) category = "shirt";
      else if (query.includes('pant') || query.includes('chino')) category = "pant";
      else if (query.includes('coat') || query.includes('overcoat')) category = "outerwear";

      // Parse price limit
      let priceLimit = Infinity;
      const priceMatch = query.match(/(?:under|below|rs|inr|₹)\s*(\d+)/) || query.match(/(\d+)\s*(?:inr|rs|₹|under|below)/);
      if (priceMatch) {
        priceLimit = parseInt(priceMatch[1]);
      }

      recommendedProducts = allProducts.filter(p => {
        let matchesCat = category ? p.category.toLowerCase().includes(category) : true;
        let matchesPrice = p.price * (1 - (p.discount || 0)/100) <= priceLimit;
        return matchesCat && matchesPrice;
      });

      if (recommendedProducts.length > 0) {
        reply = `I have curated **${recommendedProducts.length}** exclusive piece(s) matching your request:`;
      } else {
        reply = "I searched our digital catalog but couldn't find pieces matching that specific category and price window. Here are some of our trending seasonal essentials instead:";
        recommendedProducts = allProducts.slice(0, 2);
      }
    } 
    // 5. Default Response (FAQs & Styling Advice)
    else {
      reply = `Welcome to the FashionHub Personal Styling Service, ${userName}. 
      I am your AI Stylist, trained in modern fashion principles, size consultation, and wardrobe curation.

      Here is how I can assist you today:
      * **Size Consultations**: "What size fits a 6ft frame and 80kg weight?"
      * **Catalog Curation**: "Show me winter coats or hoodies under ₹4000"
      * **Styling Tips**: "What pants pair well with a cream silk shirt?"
      * **Order Logistics**: "Track my order ord-2"

      How may I help elevate your wardrobe today?`;
    }

    res.status(200).json({
      reply,
      products: recommendedProducts.map(p => ({
        id: p.id || p._id,
        name: p.name,
        price: p.price,
        discount: p.discount,
        images: p.images,
        category: p.category
      }))
    });
  } catch (err) {
    console.error('AI Chatbot error:', err);
    res.status(500).json({ message: 'Server error processing chatbot query.' });
  }
};
