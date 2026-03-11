# src/rag_pipeline.py

from typing import Any
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

from src.retriever import RAGRetriever

load_dotenv()


def create_llm():
    api_key = os.getenv("APIKEY")

    llm = ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.1-8b-instant",
        temperature=0.1,
        max_tokens=1024
    )

    return llm


def rag_simple_qa(query: str, retriever: RAGRetriever, llm: Any, top_k: int = 5) -> str:

    results = retriever.retrieve(query, top_k=top_k)

    if not results:
        return "No relevant documents found."

    context = "\n\n".join(doc["content"] for doc in results)

    if not context:
        return "No relevant context found to answer the question."

    prompt = f"""Use the following context to answer the question concisely.

Context:
{context}

Question: {query}

Answer:"""

    response = llm.invoke(prompt)

    return response.content