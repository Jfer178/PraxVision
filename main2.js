async function Send(){
    const prompt = document.getElementById('prompt').value;
    const imageInput = document.getElementById('image');
    const responseDiv = document.getElementById('response');
    responseDiv.innerHTML = "Esperando respuesta...";

    let base64Image = null;
    if(imageInput.files.length > 0){
        const file = imageInput.files[0];
        base64Image = await convertImageToBase64(file);
    }

    try{
        const responseBody = {
            model: "llava:13b",
            prompt: `Responde en español. ${prompt}`,
            stream: true
        };

        if (base64Image){
            responseBody.images = [base64Image]
        }
        

        const response = await fetch("http://localhost:11434/api/generate", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(responseBody)
        });

        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        responseDiv.innerHTML = "";
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while(true){
            const {done, value} = await reader.read();
            if(done){
                break;
            }
            const textchunk = decoder.decode(value, {stream: true});
            const json = JSON.parse(textchunk);
            
            responseDiv.innerHTML += json.response;
            
        }
        
    } catch(error){
        console.error('Error:', error);
        responseDiv.innerHTML = `<strong>Error:</strong> ${error.message}`;
    }
}

function convertImageToBase64(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}
