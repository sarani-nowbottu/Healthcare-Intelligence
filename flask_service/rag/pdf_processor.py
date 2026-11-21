"""
PDF Processing, Text Extraction & Semantic Chunking Engine
AI-Powered Healthcare Policy Intelligence & Prediction System
"""

import os
import re
import pypdf

class PolicyPDFProcessor:
    def __init__(self, chunk_size=500, chunk_overlap=100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def clean_text(self, text):
        """Normalizes whitespace and removes page artifact noise."""
        if not text:
            return ""
        # Remove repeated hyphens or underscores
        text = re.sub(r'[-_]{3,}', ' ', text)
        # Normalize multiple spaces, tabs and linebreaks
        text = re.sub(r'\s+', ' ', text)
        return text.strip()

    def process_pdf(self, pdf_path):
        """
        Extracts text page-by-page from a PDF file, decomposes it into overlapping chunks,
        and annotates each chunk with source metadata.
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        filename = os.path.basename(pdf_path)
        doc_title = os.path.splitext(filename)[0].replace('_', ' ')

        reader = pypdf.PdfReader(pdf_path)
        total_pages = len(reader.pages)
        chunks = []
        global_chunk_idx = 0

        for page_num, page in enumerate(reader.pages, start=1):
            raw_text = page.extract_text() or ""
            cleaned_page = self.clean_text(raw_text)
            if not cleaned_page:
                continue

            words = cleaned_page.split(' ')
            start = 0
            while start < len(words):
                end = min(start + self.chunk_size, len(words))
                chunk_words = words[start:end]
                chunk_text = ' '.join(chunk_words)

                chunks.append({
                    'chunk_id': f"{filename}#p{page_num}#c{global_chunk_idx}",
                    'document_name': filename,
                    'document_title': doc_title,
                    'page_number': page_num,
                    'total_pages': total_pages,
                    'text': chunk_text,
                    'word_count': len(chunk_words)
                })
                global_chunk_idx += 1

                if end >= len(words):
                    break
                start += (self.chunk_size - self.chunk_overlap)

        return {
            'document_name': filename,
            'document_title': doc_title,
            'total_pages': total_pages,
            'total_chunks': len(chunks),
            'chunks': chunks
        }

    def process_directory(self, directory_path):
        """Processes all PDF documents in a given directory."""
        all_docs = []
        all_chunks = []
        if not os.path.exists(directory_path):
            return all_docs, all_chunks

        for fname in sorted(os.listdir(directory_path)):
            if fname.lower().endswith('.pdf'):
                full_path = os.path.join(directory_path, fname)
                try:
                    res = self.process_pdf(full_path)
                    all_docs.append({
                        'document_name': res['document_name'],
                        'document_title': res['document_title'],
                        'total_pages': res['total_pages'],
                        'total_chunks': res['total_chunks'],
                        'file_path': full_path
                    })
                    all_chunks.extend(res['chunks'])
                except Exception as e:
                    print(f"Error processing {fname}: {e}")

        return all_docs, all_chunks

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    policies_dir = os.path.join(base_dir, 'policies_storage')
    processor = PolicyPDFProcessor()
    docs, chunks = processor.process_directory(policies_dir)
    print(f"Processed {len(docs)} documents and generated {len(chunks)} chunks.")
    if chunks:
        print("\nSample chunk 0:")
        print(f"Source: {chunks[0]['document_title']} (Page {chunks[0]['page_number']})")
        print(f"Snippet: {chunks[0]['text'][:150]}...")
