const TaskManager = {

    getList: ()=>{
        return Object.entries(TaskManager.container).map(x=>x[0])
    },
    
    container :{},
    
    gotoNextTask :(local,activeTask)=>{
        let nextTaskId = TaskManager.getList()[TaskManager.getList().indexOf(activeTask)+1];
        console.log("Closing Task : "+activeTask);
        TaskManager.gotoTask(local,nextTaskId);
    },
    
    gotoTask : (local,taskId)=>{
        if(TaskManager.getList().indexOf(taskId)!=-1){
            // Update Task Status
            local._taskManager.isWorking = true
            local._taskManager.activeTask = taskId;
            console.log("Active Task : "+taskId);
            
            $box.setLocal(local,{
                onSet : ()=> {
                    console.log("Next Task is -> "+taskId);
                    TaskManager.container[taskId]();
                } 
            });
            
        }else{
            console.log("Task Not Found : "+taskId);
        }
        
    },
    
    startPendingTask : (local)=>{
        console.log("Starting Pendin Process.");
        if(local._taskManager.isWorking){
            console.log("Pending Process Found : "+local._taskManager.activeTask);
            TaskManager.container[local._taskManager.activeTask]();
        }else{
            console.log("No Active Task Found");
        }
    },
    
    randInterval: {
        timer : false,
        start : (callback,min=5000,max=12000)=>{

            // Stopping in case already started
            TaskManager.randInterval.stop();
            
            var rand = $fc.randBetween(min,max);
            console.log(rand);
            TaskManager.randInterval.timer = setTimeout(()=>{
                // Call callback with new rand value
                callback(rand);
                
                if(TaskManager.randInterval.timer){
                    TaskManager.randInterval.start(callback,min,max);
                }
                
            }, rand);
        },
        stop : ()=>{
            console.log("Stoping TaskManager Timer");
            clearTimeout(TaskManager.randInterval.timer);
            TaskManager.randInterval.timer = false;
        }
    }
    
};