"""
Local Semantic Vector Index & Semantic Retriever
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pdf_processor import PolicyPDFProcessor

class PolicyVectorStore:
    def __init__(self):
        self.processor = PolicyPDFProcessor()
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            sublinear_tf=True,
            stop_words='english',
            max_df=0.95
        )
        self.documents = []
        self.chunks = []
        self.tfidf_matrix = None
        self.is_indexed = False

    def build_index(self, policies_dir):
        """Extracts text from all PDFs and builds the retrieval index."""
        docs, chunks = self.processor.process_directory(policies_dir)
        self.documents = docs
        self.chunks = chunks

        if not chunks:
            self.is_indexed = False
            return 0

        corpus = [c['text'] for c in chunks]
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.is_indexed = True
        return len(chunks)

    def search(self, query, top_k=4, min_score=0.05):
        """
        Retrieves top_k most relevant chunks for a user query using cosine similarity.
        """
        if not self.is_indexed or self.tfidf_matrix is None or not self.chunks:
            return []

        query_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vec, self.tfidf_matrix)[0]

        top_indices = np.argsort(scores)[::-1]
        results = []

        for idx in top_indices:
            score = float(scores[idx])
            if score < min_score and len(results) >= 1:
                break
            chunk = self.chunks[idx]
            results.append({
                'chunk_id': chunk['chunk_id'],
                'document_name': chunk['document_name'],
                'document_title': chunk['document_title'],
                'page_number': chunk['page_number'],
                'total_pages': chunk['total_pages'],
                'text': chunk['text'],
                'score': round(score, 4)
            })
            if len(results) >= top_k:
                break

        return results

    def get_document_summary_context(self, document_name):
        """Retrieves all chunks belonging to a specific policy for summarization."""
        matched = [c['text'] for c in self.chunks if c['document_name'].lower() == document_name.lower()]
        return '\n\n'.join(matched)

    def list_documents(self):
        """Returns metadata of all ingested policy documents."""
        return self.documents

# Global vector store instance
vector_store = PolicyVectorStore()

# Auto-initialize default policies if storage exists
_default_policy_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'policies_storage')
if os.path.exists(_default_policy_dir):
    vector_store.build_index(_default_policy_dir)

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    p_dir = os.path.join(base_dir, 'policies_storage')
    n = vector_store.build_index(p_dir)
    print(f"Indexed {n} chunks from {len(vector_store.documents)} policies.")
    
    test_q = "What is the cash assistance amount for institutional delivery under Janani Suraksha Yojana in Low Performing States?"
    hits = vector_store.search(test_q, top_k=2)
    print(f"\nQuery: {test_q}")
    for i, h in enumerate(hits, 1):
        print(f"\n[{i}] Score: {h['score']} | {h['document_title']} (Page {h['page_number']})")
        print(f"Snippet: {h['text'][:200]}...")
