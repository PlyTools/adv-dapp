import os
import tweepy
from dotenv import load_dotenv

class TwitterService:
    def __init__(self):
        load_dotenv()
        self.client = tweepy.Client(
            bearer_token=os.getenv('TWITTER_BEARER_TOKEN'),
            consumer_key=os.getenv('TWITTER_API_KEY'),
            consumer_secret=os.getenv('TWITTER_API_SECRET'),
            access_token=os.getenv('TWITTER_ACCESS_TOKEN'),
            access_token_secret=os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
        )

    def get_latest_morphic_tweet(self) -> str:
        """Get the latest tweet from Morphic Network"""
        try:
            user = self.client.get_user(username="morphicnetwork")
            if not user.data:
                print("Could not find Morphic Network's Twitter account")
                return ""
                
            user_id = user.data.id
            tweets = self.client.get_users_tweets(
                id=user_id,
                # exclude=['retweets', 'replies'],
                tweet_fields=['text'],
                max_results=2
            )
            
            print(f"Tweet response type: {type(tweets)}")
            print(f"Tweet data type: {type(tweets.data) if tweets.data else 'No data'}")
            print(f"Number of tweets retrieved: {len(tweets.data) if tweets.data else 0}")
            
            if tweets.data:
                latest_tweet = tweets.data[0].text
                print(f"Latest Morphic Network Tweet:\n{latest_tweet}")
                return latest_tweet
            return ""
        except Exception as e:
            print(f"Error fetching tweet ({type(e).__name__}): {str(e)}")
            return "" 