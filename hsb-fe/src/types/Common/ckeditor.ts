export function Base64UploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return {
        upload: () => {
          return loader.file.then((file: File) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve({ default: reader.result });
              reader.onerror = (error) => reject(error);
              reader.readAsDataURL(file);
            });
          });
        },
        abort: () => {
          alert('에디터 업로드에 실패했어요');
        },
      };
    };
  }
  