"use strict"
import axios from '../axios';
type Options = {
    authKey: string,
}
type Type = "voice" | "text";
class Msg91 {
    private authKey?: string;
    private initialized: boolean = false;
    initialize(options: Options) {
        if (this.initialized) throw new Error("MSG91 already initialized");
        this.authKey = options.authKey;
        this.initialized = true;
    }
    private validateInit() {
        if (!this.initialized) throw new Error("Call the initialize() first");
    }
    getCampaign(options?: { authKey?: string }) {
        this.validateInit();
        return new Campaign(options?.authKey || this.authKey || "");
    }
    getOTP(templateId: string, options: { authKey?: string }) {
        this.validateInit();
        return new Otp(templateId, options?.authKey || this.authKey || "");
    }
    getSMS(options?: { authKey?: string }) {
        this.validateInit();
        return new Sms(options?.authKey || this.authKey || "");
    }
}
type SmsOptions = {
    senderId?: string,
    shortURL?: boolean
}
type SmsRecipients = {
    mobile: string,
    [key: string]: string
}
class Sms {
    authKey: string;
    constructor(authKey: string) {
        this.authKey = authKey;
    }
    send(flowId: string, recipient: SmsRecipients | [SmsRecipients], options?: SmsOptions) {
        return new Promise((resolve, reject) => {
            const url = new URL(`https://api.msg91.com/api/v5/flow/`);
            var data: any = {
                flow_id: flowId,
            };
            if (!Array.isArray(recipient)) {
                data = { ...data, ...recipient, 'mobiles': recipient.mobile };
            } else {
                data.recipients = recipient
            }
            if (options?.senderId) data.sender = options.senderId;
            if (options?.shortURL != null) data.short_url = options.shortURL ? '1' : '0';
            var config = {
                method: 'post',
                url: url.toString(),
                headers: {
                    authkey: this.authKey
                },
                data: JSON.stringify(data)
            };

            axios(config)
                .then(function ({ data }) {
                    const { message, type }: any = data;
                    switch (type) {
                        case "success":
                            return resolve({ message })
                            break;
                        case "error":
                            return reject({ message })
                            break;
                        default:
                            return resolve(data)
                            break;
                    }
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    }

}
type Channel = {
    campaign_id: number,
    channel_id: number,
    count: number
}
type CampaignType = {
    id: number,
    name: string,
    is_active: boolean,
    slug: string,
    channels: [Channel]

}
type Field = {
    mapping: [{ [key: string]: any }],
    variables: [string]
}
class Campaign {
    private authKey: string;
    constructor(authKey: string) {
        this.authKey = authKey;
    }

    getAll(): Promise<[CampaignType]> {
        return new Promise((resolve, reject) => {
            const url = new URL("https://control.msg91.com/api/v5/campaign/api/campaigns");
            var config = {
                method: 'get',
                url: url.toString(),
                headers: {
                    authkey: this.authKey

                }
            };
            axios(config)
                .then(function ({ data }) {
                    const { hasError, errors, status }: any = data;
                    switch (status) {
                        case "success":
                            return resolve(data?.data?.data || [])
                            break;
                        case "error":
                            return reject({ errors })
                            break;
                        default:
                            return resolve(data?.data?.data || [])
                            break;
                    }
                })
                .catch(function (error) {
                    // console.log(error);
                    return reject(error);
                });
        });
    }
    getFields(slug: string): Promise<Field> {
        return new Promise((resolve, reject) => {
            const url = new URL(`https://control.msg91.com/api/v5/campaign/api/campaigns/${slug}/fields`);
            var config = {
                method: 'get',
                url: url.toString(),
                headers: {
                    authkey: this.authKey
                }
            };

            axios(config)
                .then(function ({ data }) {
                    const { hasError, errors, status }: any = data;
                    switch (status) {
                        case "success":
                            return resolve(data?.data)
                            break;
                        case "error":
                            return reject({ errors })
                            break;
                        default:
                            return resolve(data?.data)
                            break;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    return reject(error);
                });
        });
    }
    getBody(slug: string) {
        return new Promise((resolve, reject) => {
            const url = new URL(`https://control.msg91.com/api/v5/campaign/api/campaigns/${slug}/snippets`);
            var config = {
                method: 'get',
                url: url.toString(),
                headers: {
                    authkey: this.authKey
                }
            };

            axios(config)
                .then(function ({ data }) {
                    const { hasError, errors, status }: any = data;
                    switch (status) {
                        case "success":
                            return resolve(data?.data?.requestBody?.data)
                            break;
                        case "error":
                            return reject({ errors })
                            break;
                        default:
                            return resolve(data?.data?.requestBody?.data)
                            break;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    return reject(error);
                });
        });
    }
    run(slug: string, body: any) {
        return new Promise((resolve, reject) => {
            const url = new URL(`https://control.msg91.com/api/v5/campaign/api/campaigns/${slug}/run`);
            var data = JSON.stringify(body);
            var config = {
                method: 'post',
                url: url.toString(),
                headers: {
                    authkey: this.authKey
                },
                data: data
            };

            axios(config)
                .then(function ({ data }) {
                    const { message, type }: any = data;
                    switch (type) {
                        case "success":
                            return resolve({ message })
                            break;
                        case "error":
                            return reject({ message })
                            break;
                        default:
                            return resolve(data)
                            break;
                    }
                })
                .catch(function (error) {
                    console.log(error);
                    return reject(error);
                });
        });
    }
    send(slug: string, body: any) {
        return this.run(slug, body);
    }
}
type OtpOptions = {
    templateId?: string,
    expiry?: number // In Minutes
}
class Otp {
    private templateId: string;
    private authkey: string;
    constructor(templateId: string, authkey: string) {
        this.templateId = templateId;
        this.authkey = authkey;
    }
    retry(mobileNumber: string, type: Type = "text") {
        return new Promise((resolve, reject) => {

            const url = new URL("https://api.msg91.com/api/v5/otp/retry");
            url.searchParams.append("retrytype", type);
            url.searchParams.append("mobile", mobileNumber);
            url.searchParams.append("authkey", this.authkey);
            var config = {
                method: 'post',
                url: url.toString()
            };

            axios(config)
                .then(function ({ data, status }) {
                    const { message, type }: any = data;
                    switch (type) {
                        case "success":
                            return resolve({ message })
                            break;
                        case "error":
                            return reject({ message })
                            break;
                        default:
                            return resolve(data)
                            break;
                    }
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    }

    verify(mobileNumber: string, otp: string) {
        return new Promise((resolve, reject) => {
            if (!otp) {
                return reject(new Error("Provide OTP to verify"));
            }
            const url = new URL("https://api.msg91.com/api/v5/otp/verify");
            url.searchParams.append("otp", otp);
            url.searchParams.append("mobile", mobileNumber);
            url.searchParams.append("authkey", this.authkey);
            var config = {
                method: 'post',
                url: url.toString(),
            };

            axios(config)
                .then(function ({ data, status }) {
                    const { message, type }: any = data;
                    switch (type) {
                        case "success":
                            return resolve({ message })
                            break;
                        case "error":
                            return reject({ message })
                            break;
                        default:
                            return resolve(data)
                            break;
                    }
                })
                .catch(function (error) {
                    return reject(error);
                });

        });
    }
    send(mobileNumber: string, { templateId, expiry }: OtpOptions) {
        return new Promise((resolve, reject) => {
            const url = new URL("https://api.msg91.com/api/v5/otp");
            if (expiry) url.searchParams.append("otp_expiry", expiry.toString());
            url.searchParams.append("template_id", templateId || this.templateId);
            url.searchParams.append("mobile", mobileNumber);
            url.searchParams.append("authkey", this.authkey);
            var config = {
                method: 'post',
                url: url.toString()
            };

            axios(config)
                .then(function ({ data }) {
                    const { message, type }: any = data;
                    switch (type) {
                        case "success":
                            return resolve({ message })
                            break;
                        case "error":
                            return reject({ message })
                            break;
                        default:
                            return resolve(data)
                            break;
                    }
                })
                .catch(function (error) {
                    return reject(error);
                });
        });
    }
}


export default module.exports = (() => {
    var object = null;
    if (object) {
        return object;
    } else {
        return object = new Msg91();

    }
})();