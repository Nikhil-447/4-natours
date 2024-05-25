const nodemailer = require('nodemailer');
const pug  = require('pug');
const htmltotext = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email{
    constructor(user, url){
this.to =user.email;
this.firstname = user.name.split(' ')[0];
this.url =url;
this.from =`Nikhil Naryana <${process.env.EMAIL_FROM}>`
}

newTransport(){
    if(process.env.NODE_ENV ==='production'){
//in production send real email use Send Grid
        return nodemailer.createTransport({
            service:'SendGrid',
            auth:{
                user:process.env.SENDGRID_USERNAME,
                pass:process.env.SENDGRID_PASSWORD
            }
        })
    }

    //in development use mailtrap
    return nodemailer.createTransport({
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
            //Activate "less secure app" in Gmail
        })
}
async send(template, subject){
//send the actual email

//1. Render HTML based on Pug template
const html = pug.renderFile(`${__dirname}/../views/emails/${template.pug}`, {
    firstname:this.firstname,
    url:this.url,
    subject
})
//2. Define Email Options
const mailOptions ={
    from:this.from,
    to:this.to,
    subject,
    html,
    text:htmltotext.fromString(html)
};

//3. Create a Transport & Send Email
await this.newTransport().sendMail(mailOptions);

}
async sendWelcome(){
    await this.send('welcome', 'Welcome to the Nators Family!')
}
};



