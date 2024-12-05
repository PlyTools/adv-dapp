import random
import json
import os
from typing import List, Dict, Any

from langchain.chains import LLMChain
from langchain.tools import Tool
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain.schema.messages import HumanMessage, AIMessage
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import (
    TextLoader,
    PDFMinerLoader,
    DirectoryLoader
)
from langchain.text_splitter import RecursiveCharacterTextSplitter

from src.services.blockchain import BlockchainService
from src.services.twitter import TwitterService

class LlmService:
    def __init__(self):
        self.llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0.7)
        self.blockchain_service = BlockchainService()
        self.twitter_service = TwitterService()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            chat_memory=ChatMessageHistory()
        )
        self.vector_store = self.setup_vector_store()
        self.agent_executor = self._setup_agent()

    def _setup_agent(self):
        """Setup LangChain agent with tools and prompt."""
        tools = [
            Tool(
                name="deploy_meme_contract",
                description="Deploy a meme contract with a specified name. Input should be the meme name.",
                func=self._deploy_meme_contract
            ),
            Tool(
                name="fetch_latest_tweets",
                description="Fetch the latest tweets from the Morphic Network. No input needed.",
                func=self._fetch_latest_tweets
            ),
            Tool(
                name="search_knowledge_base",
                description="Search the knowledge base for relevant information. Input should be the search query.",
                func=self._search_knowledge_base
            )
        ]

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant for the Meme Agent platform. 
            You can help users deploy meme contracts, check latest tweets, and answer questions using the knowledge base.
            Always provide clear and concise responses."""),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad")
        ])

        agent = create_openai_functions_agent(self.llm, tools, prompt)
        return AgentExecutor(
            agent=agent,
            tools=tools,
            memory=self.memory,
            verbose=True
        )

    def _deploy_meme_contract(self, meme_name: str) -> str:
        """Deploy a meme contract with the specified name."""
        token_symbol = "MEME"
        contract_address = self.blockchain_service.deploy_meme_contract(meme_name, token_symbol)
        return f"Deployed MEME token '{meme_name}' at address: {contract_address}"

    def _fetch_latest_tweets(self) -> str:
        """Fetch the latest tweets from Twitter."""
        latest_tweet = self.twitter_service.get_latest_morphic_tweet()
        return f"Latest Tweet: {latest_tweet}"

    def _search_knowledge_base(self, query: str) -> str:
        """Search the knowledge base using vector similarity."""
        docs = self.vector_store.similarity_search(query, k=3)
        if not docs:
            return "No relevant information found in the knowledge base."
        
        results = []
        for doc in docs:
            results.append(f"Source: {doc.metadata.get('source', 'Unknown')}\n{doc.page_content}")
        
        return "\n\n".join(results)

    def get_answer(self, question: str) -> str:
        """Process user input using the LangChain agent."""
        try:
            response = self.agent_executor.invoke({"input": question})
            return response["output"]
        except Exception as e:
            return f"An error occurred while processing your request: {str(e)}"

    def setup_vector_store(self):
        """Setup FAISS vector store with documents from the knowledges folder."""
        embeddings = OpenAIEmbeddings()
        vector_store_path = "vector_store"
        
        # If vector store exists and is up to date, load it
        if self._is_vector_store_current(vector_store_path):
            return FAISS.load_local(
                vector_store_path,
                embeddings,
                allow_dangerous_deserialization=True  # Only enable this because we trust our local files
            )
        
        # Load documents from knowledges folder
        if not os.path.exists('knowledges'):
            os.makedirs('knowledges')
        
        loader = DirectoryLoader(
            'knowledges',
            glob="**/*",
            loader_cls=lambda path: self._get_loader_for_file(path),
            show_progress=True,
            use_multithreading=True
        )
        documents = loader.load()
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        texts = text_splitter.split_documents(documents)
        
        # Create and save vector store
        vector_store = FAISS.from_documents(texts, embeddings)
        vector_store.save_local(vector_store_path)
        return vector_store
    
    def _get_loader_for_file(self, file_path: str):
        """Return appropriate loader based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == '.pdf':
            return PDFMinerLoader(file_path)
        elif ext in ['.txt', '.md']:
            return TextLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    def _is_vector_store_current(self, vector_store_path: str) -> bool:
        """Check if vector store exists and is up to date with knowledge files."""
        if not os.path.exists(vector_store_path):
            return False
            
        # Get last modified time of vector store
        vector_store_time = os.path.getmtime(vector_store_path)
        
        # Check if any knowledge files are newer than vector store
        for root, _, files in os.walk('knowledges'):
            for file in files:
                file_path = os.path.join(root, file)
                if os.path.getmtime(file_path) > vector_store_time:
                    return False
        
        return True
