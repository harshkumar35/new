var taskManagerScrapingInterval = null;

TaskManager.container.start = () => {
    $box.getLocal(local => {
        local.status = true;
        $box.setLocal(local, {
            onSet: () => {
                console.log("Opening Google Maps");
                TaskManager.gotoTask(local, 'openMap');
            }
        });
    });
};

TaskManager.container.openMap = () => {
    $box.getLocal(local => {
        console.log(local);


        if (local.taskList.length) {
            local.activeQuery = local.taskList[0];
            local.activeKeyword = local.activeQuery.split('~in~')[0].trim();
            local.activeLocation = local.activeQuery.split('~in~')[1].trim();
            local.activeQuery = local.activeQuery.replace('~in~', ' in ');
            $box.setLocal(local, {
                onSet: () => {
                    console.log("Open Map");
                    console.log(local);
                    $box.closeTabIfIncludes('ref=extension');
                    $box.closeTabIfIncludes('maps');
                    // open google maps instead of google search
                    // $box.openPopup(`https://www.google.com/search?q=${local.activeQuery}&tbm=lcl&ref=extension&hl=en`);
                    $box.openPopup(`https://www.google.com/maps/search/${local.activeQuery}`);
                }
            });
        } else {
            console.log("Task List is empty");
            TaskManager.gotoTask(local, 'completed');
        }

    });
};


TaskManager.container.completed = () => {
    $box.notify("Scraping Completed");
    $box.getLocal(local => {
        console.log('** Stopping task manager.');
        TaskManager.gotoTask(local, 'stop');
    });
};

TaskManager.container.stop = () => {
    $box.getLocal(local => {
        local._taskManager.isWorking = false;
        local.status = false;
        console.log("Stoping Taskmanager");
        console.log(taskManagerScrapingInterval);
        clearInterval(taskManagerScrapingInterval);
        $box.setLocal(local, {
            onSet: () => {
                console.log("Stoping TaskManager");
                console.log(local);
                // closing GoogleMaps tabs
                $box.closeTabIfIncludes('maps');
            }
        });
    });
};