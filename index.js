/**
 * 
 * @param {string} videoUrl - Facebook video URL (required)
 * @param {string} [cookie] - Facebook cookie (optional)
 * @param {string} [useragent] - User agent (optional)
 * @returns 
*/
const getFBInfo = (videoUrl, cookie, useragent) => {
  const axios = require("axios");

  const headers = {
    "sec-fetch-user": "?1",
    "sec-ch-ua-mobile": "?0",
    "sec-fetch-site": "none",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "cache-control": "max-age=0",
    authority: "www.facebook.com",
    "upgrade-insecure-requests": "1",
    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
    "user-agent":
      useragent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    cookie:
      cookie || "sb=A9xHZ4WUKnlkSGllM6rB1KUQ;datr=Ay1sZ8gtTXkiPUePPS5k03E8;ps_l=1;ps_n=1;c_user=61569107684437;xs=13%3AahbVmlIWo63x1w%3A2%3A1735617748%3A-1%3A10316;fbl_st=100426927%3BT%3A28943086;wl_cbv=v2%3Bclient_version%3A2710%3Btimestamp%3A1736585164;vpd=v1%3B1071x891x2.082077741622925;wd=891x1667;locale=en_US;fr=1ezIK3R2vRMAtMfd7.AWVsg8lRQaqEzOUUc_nLllaThOQ.Bng0Mh..AAA.0.0.Bnihfu.AWV6PWxZ50I;dpr=2.082077741622925;presence=C%7B%22t3%22%3A%5B%5D%2C%22utc3%22%3A1737103363096%2C%22v%22%3A1%7D;",
  };

  const parseString = (string) => JSON.parse(`{"text": "${string}"}`).text;

  return new Promise((resolve, reject) => {
    if (!videoUrl || !videoUrl.trim()) return reject("Please specify the Facebook URL");

    if (
      ["facebook.com", "fb.watch"].every((domain) => !videoUrl.includes(domain))
    ) return reject("Please enter the valid Facebook URL");

    axios.get(videoUrl, { headers }).then(({ data }) => {
      data = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

      const sdMatch = data.match(/"browser_native_sd_url":"(.*?)"/) || data.match(/"playable_url":"(.*?)"/) || data.match(/sd_src\s*:\s*"([^"]*)"/) || data.match(/(?<="src":")[^"]*(https:\/\/[^"]*)/);
      const hdMatch = data.match(/"browser_native_hd_url":"(.*?)"/) || data.match(/"playable_url_quality_hd":"(.*?)"/) || data.match(/hd_src\s*:\s*"([^"]*)"/);
      const titleMatch = data.match(/<meta\sname="description"\scontent="(.*?)"/);
      const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.*?)"/);
			
			// @TODO: Extract audio URL

      if (sdMatch && sdMatch[1]) {
        const result = {
          url: videoUrl,
          sd: parseString(sdMatch[1]),
          hd: hdMatch && hdMatch[1] ? parseString(hdMatch[1]) : "",
          title: titleMatch && titleMatch[1] ? parseString(titleMatch[1]) : data.match(/<title>(.*?)<\/title>/)?.[1] ?? "",
          thumbnail: thumbMatch && thumbMatch[1] ? parseString(thumbMatch[1]) : "",
        };

        resolve(result);
      } else reject("Unable to fetch video information at this time. Please try again");
    }).catch(_ => reject("Unable to fetch video information at this time. Please try again"));
  });
};

// getFBInfo("https://www.facebook.com/watch?v=272591278381388").then(console.log).catch(console.log);

module.exports = getFBInfo;
