import { Bot } from "grammy";
import { RequestPaymentParams } from "../types";
import { MqttService } from "./notification";

export class Coin98Payment{
  private bot: Bot
  //recommend use db for production
  private paidUsers: Map<number, string>;
  private mqttServices: MqttService

  constructor(tokenId: string){
    this.bot = new Bot(tokenId );
    this.bot.start()
    this.paidUsers = new Map<number, string>()
    this.mqttServices = new MqttService({clientId: '', requestUrl: ''})
  }

  async sendInvoice(params: RequestPaymentParams){
    const { chatId, product, others } = params

    try {

        const message = await this.bot.api.sendInvoice(chatId,
            product?.title,
            product?.description,
            product?.payload || '{}',
            product?.currency,
            product?.variants,
            {
                photo_url: others.photo_url,
                start_parameter: others.start_parameter
            }
        )

        return message
    } catch (error) {
        throw new Error(error as unknown as string)
    }
  }

  queryPreCheckout(){
    this.bot.on("pre_checkout_query", async (ctx) => {
        try {
            return await ctx.answerPreCheckoutQuery(true);
        } catch(error) {
            throw new Error(error as unknown as string)
        }
    });
  }

  onPaymentSuccessful(){
    this.bot.on("message:successful_payment", (ctx) => {
        //send notification
        
        if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
          return;
        }

        this.mqttServices.sendMessage('payment', 'Thành công rồi á nha')
      
        this.paidUsers.set(
          ctx.from.id,
          ctx.message.successful_payment.telegram_payment_charge_id,
        );
    });
  }

  checkStatusPayment(){
    this.bot.command("status", (ctx) => {
        const message = this.paidUsers.has(ctx?.from?.id as number)
          ? "You have paid"
          : "You have not paid yet";
        return ctx.reply(message);
      });
  }
}