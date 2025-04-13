import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-aa305f75e074474f9cf07e445aa0ce9a',
    dangerouslyAllowBrowser: true
});

export async function* getAIResponseStreamAPI(messages: any[]) {
    const stream = await openai.chat.completions.create({
        messages: messages,
        model: "deepseek-chat",
        stream: true
    });

    let fullContent = '';

    for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) {
            fullContent += delta;
            yield fullContent;
        }
    }
}
export default getAIResponseStreamAPI;