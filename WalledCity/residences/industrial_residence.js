class IndustrialResidence{
    constructor(node, tower, bank_account) {
        this.utils = new DrawUtils();
        this.node = node;
        this.tower = tower;
        this.bank_account = bank_account;
        this.random_utils = new RandomUtils();
    }

    draw(){
        if(this.canConstruct()){
            this.node.domElement.className = "node";
            this.node.domElement.classList.add("industrial-empty");
            this.node.type = "industrial-empty";
        }
        this.checkDemand();
    }

    canConstruct(){
        return this.node.domElement.classList[1] === "empty" || this.node.domElement.classList[1] === "empty-basement";
    }

    handleDemand(){
        if(this.node.domElement.classList[1] === "industrial-empty" && this.tower.demand.industrial >= 1){
            this.node.domElement.className = "node";
            let residence_lvl1 = ["industrial-occupied", "industrial-occupied-1", "industrial-occupied-2"];
            let residence = this.random_utils.randomInArray(residence_lvl1);
            this.node.domElement.classList.add(residence);
            this.node.type = "industrial-occupied";
            this.tower.demand.decreaseIndustrialDemand(1);
            this.tower.demand.increaseResidentialDemand(1.5);
            this.bank_account.addRenter(this.node);

            // Add job to job list
            let new_job = new Job(this.tower);
            new_job.setLocation(this.node);
            this.tower.addJob(new_job);
        }
    }

    checkDemand(){
        let self = this;
        setInterval(function () {
            if(self.tower.demand.industrial > 0){
                self.handleDemand();
            }
        }, 1000 * 15);
    }
}