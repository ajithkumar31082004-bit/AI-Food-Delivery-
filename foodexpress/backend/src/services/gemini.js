const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

function getClient() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

async function askGemini(prompt, systemInstruction) {
  const client = getClient();
  if (!client) {
    return { fallback: true, text: 'AI features require GEMINI_API_KEY in .env' };
  }
  try {
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction || 'You are FoodGPT, an AI assistant for FoodExpress food delivery app. Respond in JSON when asked.'
    });
    const result = await model.generateContent(prompt);
    return { text: result.response.text() };
  } catch (err) {
    console.error('Gemini error:', err.message);
    return { error: err.message };
  }
}

function parseJSON(text) {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (match) {
    try { return JSON.parse(match[0]); } catch { /* fall through */ }
  }
  return null;
}

async function foodAssistant(query, menuItems) {
  const menuStr = menuItems.slice(0, 50).map(f =>
    `ID:${f.id} ${f.name} ₹${f.price} ${f.isVeg ? 'Veg' : 'Non-Veg'} @ ${f.Restaurant?.name || 'Unknown'}`
  ).join('\n');

  const res = await askGemini(
    `User query: "${query}"\n\nAvailable menu:\n${menuStr}\n\nReturn JSON: {"recommendations":[{"id":number,"name":string,"reason":string}],"message":string}`,
    'Recommend dishes from the menu only. Return valid JSON.'
  );
  if (res.fallback || res.error) return { message: res.text || res.error, recommendations: [] };
  const parsed = parseJSON(res.text);
  return parsed || { message: res.text, recommendations: [] };
}

async function smartSearch(query) {
  const res = await askGemini(
    `Convert this food search to filters: "${query}"\nReturn JSON: {"search":"","maxPrice":null,"minRating":null,"isVeg":null,"cuisineType":"","sortBy":"rating"}`,
    'Extract search intent for a food delivery app. Use null for unspecified filters.'
  );
  if (res.fallback || res.error) return { search: query };
  return parseJSON(res.text) || { search: query };
}

async function summarizeReviews(reviews, rating) {
  const reviewText = reviews.slice(0, 30).map(r => r.comment).join('\n');
  const res = await askGemini(
    `Restaurant rating: ${rating}/5\nReviews:\n${reviewText}\n\nReturn JSON: {"pros":["..."],"cons":["..."],"sentiment":"positive|neutral|negative","summary":"..."}`,
    'Summarize restaurant reviews concisely.'
  );
  if (res.fallback || res.error) {
    return { pros: ['Good food'], cons: [], sentiment: 'positive', summary: 'Customers generally enjoy this restaurant.' };
  }
  return parseJSON(res.text) || { summary: res.text };
}

async function analyzeNutrition(foodName, description) {
  const res = await askGemini(
    `Estimate nutrition for: "${foodName}" - ${description || ''}\nReturn JSON: {"calories":number,"protein":number,"carbs":number,"fat":number,"healthScore":number}`,
    'Provide reasonable nutritional estimates for Indian food items.'
  );
  if (res.fallback || res.error) {
    return { calories: 350, protein: 12, carbs: 45, fat: 15, healthScore: 6 };
  }
  return parseJSON(res.text) || { calories: 350, protein: 12, carbs: 45, fat: 15, healthScore: 6 };
}

async function generateRestaurantDescription(name, cuisine) {
  const res = await askGemini(
    `Generate marketing description for restaurant "${name}" serving ${cuisine} cuisine.\nReturn JSON: {"description":"...","tagline":"...","seoKeywords":["..."]}`,
    'Write appetizing, SEO-friendly restaurant descriptions.'
  );
  if (res.fallback || res.error) {
    return { description: `Welcome to ${name}, your destination for authentic ${cuisine} cuisine.`, tagline: `Best ${cuisine} in town`, seoKeywords: [cuisine, name] };
  }
  return parseJSON(res.text) || { description: res.text };
}

async function generateCoupon(userStats) {
  const res = await askGemini(
    `User stats: ${JSON.stringify(userStats)}\nGenerate personalized coupon.\nReturn JSON: {"code":"...","discountType":"percentage|flat","discountValue":number,"message":"..."}`,
    'Create catchy coupon codes like WELCOME20, SAVE100.'
  );
  if (res.fallback || res.error) {
    return { code: 'FOODGPT10', discountType: 'percentage', discountValue: 10, message: '10% off your next order!' };
  }
  return parseJSON(res.text) || { code: 'FOODGPT10', discountType: 'percentage', discountValue: 10 };
}

async function mealRecommendation(userContext, menuItems) {
  const menuStr = menuItems.slice(0, 40).map(f =>
    `${f.name} ₹${f.price} @ ${f.Restaurant?.name}`
  ).join('\n');

  const res = await askGemini(
    `Context: ${JSON.stringify(userContext)}\nMenu:\n${menuStr}\n\nRecommend meals for current time of day.\nReturn JSON: {"meals":[{"name":string,"restaurant":string,"price":number,"calories":number,"reason":string}],"greeting":string}`,
    'Personalize food recommendations based on order history and time of day.'
  );
  if (res.fallback || res.error) return { meals: [], greeting: 'Here are some suggestions for you!' };
  return parseJSON(res.text) || { meals: [], greeting: res.text };
}

async function orderForecast(orderHistory) {
  const res = await askGemini(
    `Order history: ${JSON.stringify(orderHistory)}\nPredict today\'s orders.\nReturn JSON: {"predictedOrders":number,"peakHours":["HH:00"],"popularDishes":[{"name":string,"count":number}],"insights":["..."]}`,
    'Analyze patterns for restaurant order forecasting.'
  );
  if (res.fallback || res.error) {
    return { predictedOrders: 25, peakHours: ['12:00', '19:00'], popularDishes: [], insights: ['Peak hours typically 12-2 PM and 7-9 PM'] };
  }
  return parseJSON(res.text) || { predictedOrders: 20, peakHours: ['12:00', '19:00'], popularDishes: [], insights: [] };
}

async function customerSupport(query, orderContext) {
  const res = await askGemini(
    `Customer question: "${query}"\nOrder context: ${JSON.stringify(orderContext || {})}\nProvide helpful support response.\nReturn JSON: {"response":"...","suggestedActions":["..."]}`,
    'You are FoodExpress 24/7 customer support. Be helpful about orders, refunds, delivery.'
  );
  if (res.fallback || res.error) {
    return { response: 'Thank you for contacting FoodExpress support. Please check your order tracking page for live updates.', suggestedActions: ['Track Order', 'Contact Restaurant'] };
  }
  return parseJSON(res.text) || { response: res.text, suggestedActions: [] };
}

async function parseVoiceOrder(transcript, menuItems) {
  const menuStr = menuItems.slice(0, 50).map(f => `ID:${f.id} ${f.name} ₹${f.price}`).join('\n');
  const res = await askGemini(
    `Voice order: "${transcript}"\nMenu:\n${menuStr}\n\nParse into order items.\nReturn JSON: {"items":[{"foodItemId":number,"quantity":number}],"message":string}`,
    'Parse natural language food orders into structured items from the menu.'
  );
  if (res.fallback || res.error) return { items: [], message: 'Could not parse voice order' };
  return parseJSON(res.text) || { items: [], message: res.text };
}

module.exports = {
  foodAssistant,
  smartSearch,
  summarizeReviews,
  analyzeNutrition,
  generateRestaurantDescription,
  generateCoupon,
  mealRecommendation,
  orderForecast,
  customerSupport,
  parseVoiceOrder
};
