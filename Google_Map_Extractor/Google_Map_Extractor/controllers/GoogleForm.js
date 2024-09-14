const GoogleForm = {
    attach : ()=>{
        $box.getLocal(local=>{
            local._googleform.actionUrl = $('form').attr('action');
            local._googleform.inputs = [];
            $('form').find('input[type="text"]').each((key,each)=>{
                let name = $(each).attr('name');
                local._googleform.inputs.push({
                    name : name,
                    value : ""
                });
            });
            $box.setLocal(local);
            console.log(local._googleform);
        });
    },
    
    detach : ()=>{
        $box.getLocal(local=>{
            local._googleform = $box.getDefaultLocalModel().GoogleForm;
            $box.setLocal(local);
        });
    },
    
    submit : (data)=>{
        $box.getLocal(local=>{
            let filtered = {};
            
            local._googleform.inputs.forEach((element,key) => {
                filtered[element.name] = data[key];
            });
            
            console.log(filtered);
            $.ajax({
                type:"Post",
                url : local._googleform.actionUrl,
                data : filtered
            })
        });
    }
};