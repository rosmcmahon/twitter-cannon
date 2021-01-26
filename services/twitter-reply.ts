/**
 * -= Notes =-
 * Twitter Direct Message Rate Limiting
 * Requests / 24-hour window:  15000 per app
 * 
 */

import { logger } from '../utils/logger'
import Twitter from 'twitter-lite'

const twit = new Twitter({
	consumer_key: process.env.TWITTER_API_KEY!,
	consumer_secret: process.env.TWITTER_API_SECRET!,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET,
})


export const sendSuccessTweetReply = async (tweetId: string, twitterHandle: string) => {
	logger(twitterHandle, tweetId, 'sending reply now...')

	let status = `Your Arweave tokens will be transferred shortly... :-)`

	let tweet = await twit.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	})

	if(tweet.in_reply_to_status_id_str === tweetId){
		logger(twitterHandle, 'success tweet reply sent')
		return true
	}
	logger(twitterHandle, 'ERROR, Failed in reply to tweet')
	return false
}

export const sendFailTweetReply = async (tweetId: string, twitterHandle: string) => {
	logger(twitterHandle, tweetId, 'sending reply now...')

	let status = '🤖 Bleep blorp. We can\'t be 100% sure you are human automatically! Hang tight and we will send some of our humans to check!'

	let tweet = await twit.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	})

	if(tweet.in_reply_to_status_id_str === tweetId){
		logger(twitterHandle, 'fail tweet reply sent')
		return true
	}
	logger(twitterHandle, 'ERROR, Failed in reply to tweet')
	return false
}
