# Cop It

Cop It is a Chrome Extension used to purchase any Supreme's item on each drop. Works on Windows, Mac and Linux.
Design is very simplist but it works nice.

## Features

- Multiple items keywords
- All sizes supported
- Instant buy button on every item page
- USA, Canada, Europe and Japan are supported!
- Smart auto-fill
- Start at the second when the new drop is online! (connected to a server)

## Set up

No compilation is needed, you must just have Google Chrome.

1. Clone the repository using `git clone https://github.com/chlec/Cop-It` or download it as zip (you must unzip it if you choose this method).
2. Open a Google Chrome window and go to this url `chrome://extensions/`
3. Click on `Load unpacked extensions...` and choose the folder you just download.
4. The extension is now installed!

## Some things to know

On the features tabs on the settings page, you can see some options, I will try to explain them to you.
- __Check cart before checkout__: When you use the bots with keywords, you will be redirected to your cart when keywords have been done.
- __Auto-fill checkout page__: I think this is explicit.
- __Auto submit checkout page__: Actually disabled due to the increase of Supreme's anti-bot security.
- __Automatic start when items list is updated__: If this feature is enabled, when you click on the __START__ button in the pop-up page, the extension will connect to one of my server using WebSocket to know exactly when the drop is updated. i.e if the drop release at 11:00:06am the bot will start at 11:00:06am.
- __Cop on restock if keywords match__: Similar like the previous one, the extension will connect to one of my server too and will start when a restock match with one of your keywords. To start this feature you should click on __COP ON RESTOCK__ button in the pop-up page.
- __Remove all images on Supreme's website__: Simply to increase your chance of cop if you have a low connection speed.

To cop during the drop enter all your details, keywords, and click on Start 20-30 seconds before the drop. To be quick, simply use "Auto-fill checkout page" and "Automatic start when items list is updated". The bot will put the items to your cart, redirect you to check-out page, fill this one and you just have to click on "proccess payment" button.

### Tips

To don't have captcha on the check-out, I recommand you to resolve many captchas 5 minutes before the drop. You can do this on this link: http://checkmeout.pro/recaptcha.html

Contact me at support@copit.fr if you have any question or you can post an issue.