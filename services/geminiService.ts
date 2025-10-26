
import { GoogleGenAI } from "@google/genai";
// FIX: Add EconomicEvent to imports to support the new economic calendar feature.
import { Trade, AnalysisResult, WebSource, EconomicEvent } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

export const fetchCurrentPrice = async (instrument: string): Promise<number> => {
  const prompt = `What is the current market price of ${instrument}? Respond with only the numerical price, nothing else.`;
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    const priceText = response.text.trim().replace(/,/g, '');
    const price = parseFloat(priceText);
    if (isNaN(price)) {
        throw new Error("Could not parse price from model response.");
    }
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${instrument}:`, error);
    throw new Error("Failed to fetch current market price.");
  }
};


export const analyzeTrade = async (trade: Trade): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert financial analyst. Analyze the following trade based on the provided details and real-world market data from the trade date.
    Use Google Search to find news, market sentiment, and major economic events that occurred around the date of the trade for the specified instrument.
    Provide a concise (2-3 paragraphs) analysis covering:
    1. Market Context: What were the market conditions and key drivers at the time?
    2. Strategy Alignment: Was the trader's strategy suitable for the market environment?
    3. Actionable Feedback: Offer constructive feedback for future trades.
    Format the response as clean markdown.

    Trade Details:
    - Instrument: ${trade.pair}
    - Position: ${trade.position}
    - Outcome: ${trade.outcome} (${currencyFormatter.format(trade.pnl)})
    - Trade Date: ${trade.tradeDate}
    - Stated Strategy: ${trade.strategy}
    - Trader's Notes: "${trade.notes}"

    Provide your expert analysis based on this data and grounded in real market events.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources: WebSource[] = groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is WebSource => !!web?.uri) || [];

    return { text, sources };
  } catch (error) {
    console.error("Error analyzing trade with Gemini:", error);
    return { 
        text: "There was an error analyzing the trade. Please try again.",
        sources: []
    };
  }
};

// FIX: Add function to fetch economic calendar data.
export const fetchEconomicCalendar = async (): Promise<EconomicEvent[]> => {
  const prompt = `
    Provide a list of today's high and medium impact economic calendar events relevant to forex trading.
    Include the time (in UTC), currency, impact level ('High', 'Medium', or 'Low'), event name, and the actual, forecast, and previous values.
    If a value is not available, the value for that key should be null.
    Focus on major currencies: USD, EUR, JPY, GBP, CHF, CAD, AUD, NZD.
    Return ONLY a valid JSON array of objects with the following keys: "time", "currency", "impact", "event", "actual", "forecast", "previous".
    The value for "impact" must be one of 'High', 'Medium', or 'Low'.
    Do not include any text or explanation outside of the JSON array.
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    let jsonText = response.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.substring(3, jsonText.length - 3).trim();
    }
    
    const events = JSON.parse(jsonText);
    return events;

  } catch (error) {
    console.error("Error fetching economic calendar:", error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON from Gemini response");
    }
    throw new Error("Failed to fetch economic calendar data.");
  }
};
