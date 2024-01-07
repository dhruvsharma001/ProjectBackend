const Orders = require('../models/Orders');
const Products = require('../models/Products');

const {
    Telegram
} = require('telegraf');
const tg = new Telegram(process.env.TOKEN);

module.exports = async function deleteOrder(ctx) {
  const id = ctx.state.command.args[1];
  await Orders.findOne({ magentoOrderId: id })
        .then(async (data) => {
          if (!data) {
             ctx.reply('🗿');
             ctx.reply('𝙾𝚛𝚍𝚎𝚛 𝙸𝚍 𝚗𝚘𝚝 𝚏𝚘𝚞𝚗𝚍..!!' );
            }
          else {                
                 await data.orderDetails.map(async (item, key)=>{
                  if(item.soldBy === 'Whispering Homes'){
                     try{
                      const product = await Products.findOne({SKU: item.sku});
                      if(product) {
                        let updatedQuantity =  parseInt(product.quantity) + parseInt(item.qty_ordered);
                        let stockMsg = "<strong>"+ item['name'] + " " + "</strong>"+ "<code>"+ "Remaining Quantity after order termination :" +  " " + updatedQuantity +"</code>"+ "\n";
                        console.log(stockMsg, "msg for telegram!");
                        await tg.sendMessage(process.env.GROUP_ID, stockMsg ,{parse_mode: 'HTML'});
                        await Products.updateOne({ SKU: item.sku }, { $set: {quantity: updatedQuantity } }, {
                          new: true, upsert: true
                        }).then(async(data) => {
                            console.log(data, 'updated product data after order deletion');
                        })
                      }
                      else {
                        console.log('Product not found!');
                      }
                    } catch (error) {
                      console.error('Error finding product:', error);
                    }
                  }
                 }) 
                 Orders.deleteOne({ magentoOrderId: id })
                .then(() => { ctx.reply('🗿'); ctx.reply("𝙾𝚛𝚍𝚎𝚛 𝙳𝚎𝚕𝚎𝚝𝚎𝚍 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢..!!"); })
                .catch((err) => {
                console.log(err);
                ctx.reply('🗿');
                ctx.reply("𝙴𝚛𝚛𝚘𝚛 𝚍𝚎𝚕𝚎𝚝𝚒𝚗𝚐 𝙾𝚛𝚍𝚎𝚛..!!");
                ctx.reply('❌');
         });
}
 })
      }
