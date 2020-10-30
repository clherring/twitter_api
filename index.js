const Twit = require("twit");
const natural = require("natural");
const Analyzer = require("natural").SentimentAnalyzer;
const stemmer = require("natural").PorterStemmer;
const strftime = require("strftime");
const dotenv = require("dotenv");
dotenv.config();

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  strictSSL: true, // optional - requires SSL certificates to be valid.
});

const followerCount = (h) => {
  const p = new Promise((resolve, reject) => {
    T.get("users/show", { screen_name: h }, (error, data, response) => {
      if (data) {
        resolve(data);
      } else if (error) {
        reject(error);
      }
    });
  });
  return p;
};

const tweetCollection = (h) => {
  const date = strftime("%Y-%m-%d", new Date());
  const p = new Promise((resolve, reject) => {
    T.get("search/tweets", { q: h, until: date }, function (
      err,
      data,
      response
    ) {
      if (data) {
        resolve(data);
      } else if (error) {
        reject(error);
      }
    });
  });

  return p;
};

const analyzeTweet = async (input) => {
  const tokenizer = new natural.WordTokenizer();
  const analyzer = new Analyzer("English", stemmer, "afinn");
  const sentiments = [];
  const tweets = input.statuses;
  tweets.forEach((t) => {
    const tokenTweet = tokenizer.tokenize(t.text);
    const score = analyzer.getSentiment(tokenTweet);
    sentiments.push(score);
  });

  return sentiments;
};

const getreTweets = async (input) => {
  const retweets = [];
  const tweets = input.statuses;
  // const retweet = input.statuses.retweet_count;
  tweets.forEach((t) => {
    retweets.push(t.retweet_count);
  });

  return retweets;
};

const average = (nums) => {
  return nums.reduce((a, b) => a + b) / nums.length;
};

const sum = (nums) => {
  const result = nums.reduce((a, b) => a + b);
  // console.log(result);
  return result;
};

const twit = async (handle) => {
  try {
    const data = await followerCount(handle);
    console.log("hello");
    const tweets = await tweetCollection(handle);
    const sent = await analyzeTweet(tweets);
    const retweet = await getreTweets(tweets);
    const sumRetweets = await sum(retweet);
    const avgSent = await average(sent);
    const obj = {
      twitterHandle: handle,
      followerCount: data.followers_count,
      sentiment: avgSent,
      retweetCount: sumRetweets,
    };
    return obj;
  } catch (err) {
    return err.message;
  }
};

module.exports = twit;
// (async () => {
//   console.log(await twit("ladygaga"));
// })();
