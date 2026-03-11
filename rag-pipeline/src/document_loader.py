import os
from pathlib import Path

from langchain_community.document_loaders import (
    DirectoryLoader,
    TextLoader,
    PyPDFLoader,
    PyMuPDFLoader
)

from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_all_pdfs(pdf_directory):
    """Process all PDF files in a directory"""

    all_documents = []
    pdf_dir = Path(pdf_directory)

    # Find all PDF files recursively
    pdf_files = list(pdf_dir.glob("**/*.pdf"))
    print(f"Found {len(pdf_files)} PDF files to process")

    for pdf_file in pdf_files:
        print(f"\nProcessing: {pdf_file.name}")

        try:
            loader = PyPDFLoader(str(pdf_file))
            documents = loader.load()

            # Add source information to metadata
            for doc in documents:
                doc.metadata["source_file"] = pdf_file.name
                doc.metadata["file_type"] = "pdf"

            all_documents.extend(documents)
            print(f"✓ Loaded {len(documents)} pages")

        except Exception as e:
            print(f"✗ Error: {e}")

    print(f"\nTotal documents loaded: {len(all_documents)}")
    return all_documents

def split_documents(documents, chunk_size=500, overlap=50):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )

    split_docs = text_splitter.split_documents(documents)
    return split_docs