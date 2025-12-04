import pandas as pd
import hashlib

class ETLPipeline:
    def __init__(self):
        pass

    def _anonymize_value(self, value, method="hash"):
        """
        Anonymize a single value.
        """
        if pd.isna(value):
            return value
        
        str_val = str(value)
        
        if method == "hash":
            # Simple SHA256 hash
            return hashlib.sha256(str_val.encode()).hexdigest()[:16]
        elif method == "mask":
            # Mask all but last 4 chars
            if len(str_val) <= 4:
                return "*" * len(str_val)
            return "*" * (len(str_val) - 4) + str_val[-4:]
        return value

    def _anonymize_dataframe(self, df):
        """
        Detect and anonymize sensitive columns in a DataFrame.
        """
        sensitive_keywords = ['resident_id', 'jumin', 'ssn', 'phone', 'mobile', 'tel', 'credit_card', 'card_no']
        
        for col in df.columns:
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in sensitive_keywords):
                # Determine method based on column type
                method = "mask" if "phone" in col_lower or "card" in col_lower else "hash"
                df[col] = df[col].apply(lambda x: self._anonymize_value(x, method=method))
        
        return df

    def merge_files(self, data_store, filenames):
        """
        Merge multiple DataFrames from the data store.
        
        Args:
            data_store (dict): Dictionary of {filename: DataFrame}
            filenames (list): List of filenames to merge
            
        Returns:
            pd.DataFrame: Merged DataFrame
        """
        dfs_to_merge = []
        
        for filename in filenames:
            if filename in data_store:
                df = data_store[filename].copy()
                # Add source column to track origin
                df['_source_file'] = filename
                
                # Anonymize before merging
                df = self._anonymize_dataframe(df)
                
                dfs_to_merge.append(df)
            else:
                print(f"Warning: File {filename} not found in data store.")
        
        if not dfs_to_merge:
            raise ValueError("No valid files to merge.")
            
        # Concatenate all DataFrames
        # ignore_index=True to reset index
        merged_df = pd.concat(dfs_to_merge, ignore_index=True)
        
        return merged_df
