
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-aa305f75e074474f9cf07e445aa0ce9a',
    dangerouslyAllowBrowser: true
});
const getAIResponseAPI = async(messages:any)=>{

    const completion = await openai.chat.completions.create({
        messages: messages,
        model:"deepseek-chat"
    });
    return completion.choices[0].message.content
}
export default getAIResponseAPI;

