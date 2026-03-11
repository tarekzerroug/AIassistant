
from torch import embedding

from src.document_loader import process_all_pdfs , split_documents
from src.vectorstore import VectorStore
from src.embedding_manager import EmbeddingManager      
from src.retriever import RAGRetriever  

all_documents = process_all_pdfs("data/pdf_files")

print(f"Loaded {len(all_documents)} documents")

split_docs =  split_documents(all_documents, chunk_size=500, overlap=50)

print(f"Split into {len(split_docs)} chunks")

text = [doc.page_content for doc in split_docs]

embedding_manager = EmbeddingManager()
embeddings = embedding_manager.generate_embeddings(text)


