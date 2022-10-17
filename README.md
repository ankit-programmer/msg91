# MSG91
NodeJS package for msg91 services.
## Initialize Msg91
```js
import msg91 from "msg91";
/**
*OR
*const msg91 = require('msg91').default;
*/

msg91.initialize({authKey: "Your-Auth-Key"});
```

## SMS Example
```js
let sms = msg91.getSMS();

// Send SMS
sms.send("flowId",{'mobile':"MOBILE_NUMBER_WITH_COUNTRY_CODE","VAR1":"123"});
```

## OTP Example
```js
let otp = msg91.getOTP("otpTemplateId");
// Send OTP
otp.send("MOBILE_NUMBER_WITH_COUNTRY_CODE");
// Retry OTP
otp.retry("MOBILE_NUMBER_WITH_COUNTRY_CODE");
// Verify OTP
otp.verify("MOBILE_NUMBER_WITH_COUNTRY_CODE","YOUR_OTP");
```


## Campaign Example
```js
const campaign = msg91.getCampaign();
// Get list of campaigns
campaign.getAll().then(list=>console.log(list));
// Run a campaign
campaign.run('slug', {data: {}});
```
