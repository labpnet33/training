var e=[{title:{en:`Subnet outside the VPC range`,hi:`VPC range ke bahar subnet`},ticket:{en:`A pull request adds a subnet. The platform refuses it at apply time with an invalid range message. Read the reference configuration.`,hi:`Ek pull request subnet jodta hai. Platform apply time par invalid range message ke saath use mana karta hai. Reference configuration padho.`},out:`Reference configuration (not run in the simulator)

variable "vpc_cidr" {
  default = "10.20.0.0/16"
}

resource "aws_subnet" "users" {
  vpc_id     = aws_vpc.branch.id
  cidr_block = "10.30.1.0/24"
}`,q:{en:`What is the cause?`,hi:`Wajah kya hai?`},o:[{en:`The subnet CIDR 10.30.1.0/24 is outside the VPC range 10.20.0.0/16`,hi:`Subnet CIDR 10.30.1.0/24 VPC range 10.20.0.0/16 ke bahar hai`},{en:`The resource name users is reserved`,hi:`Resource naam users reserved hai`},{en:`Terraform does not support subnets`,hi:`Terraform subnets support nahi karta`},{en:`The default must be removed`,hi:`Default hatana padega`}],a:0,w:{en:`A subnet must fall inside the CIDR of its VPC. Change the subnet to a block inside 10.20.0.0/16, such as 10.20.1.0/24, then run validate and plan again.`,hi:`Subnet apne VPC ke CIDR ke andar aana chahiye. Subnet ko 10.20.0.0/16 ke andar ke block, jaise 10.20.1.0/24, mein badlo, phir validate aur plan dobara chalao.`}},{title:{en:`A rename that replaces`,hi:`Rename jo replace kar deta hai`},ticket:{en:`An engineer tidied the code by renaming a resource local name. The plan summary reports one object to destroy and one to create for a production subnet. What explains it?`,hi:`Engineer ne resource local name rename karke code saaf kiya. Plan summary production subnet ke liye ek destroy aur ek create batati hai. Kya explain karta hai?`},out:`Reference configuration (not run in the simulator)

# before
resource "aws_subnet" "users" { ... }

# after (only the local name changed)
resource "aws_subnet" "user_lan" { ... }

Plan reading: aws_subnet.users  marked destroy
              aws_subnet.user_lan  marked create`,q:{en:`What is the right fix?`,hi:`Sahi fix kya hai?`},o:[{en:`Apply anyway, the subnet will be recreated quickly`,hi:`Phir bhi apply karo, subnet jaldi recreate ho jayega`},{en:`Delete the state file`,hi:`State file delete karo`},{en:`Add a moved block so Terraform knows the two names are the same object, or revert the rename`,hi:`Moved block jodo taaki Terraform jaane ki dono naam ek hi object hain, ya rename revert karo`},{en:`Change the provider version`,hi:`Provider version badlo`}],a:2,w:{en:`Terraform tracks objects by address. A new local name looks like a new object, so the old one is destroyed. A moved block or a revert keeps the existing subnet and avoids an outage.`,hi:`Terraform objects ko address se track karta hai. Naya local name naya object lagta hai, isliye purana destroy hota hai. Moved block ya revert maujooda subnet ko rakhta hai aur outage se bachata hai.`}},{title:{en:`Which variable value wins?`,hi:`Kaunsi variable value jeetti hai?`},ticket:{en:`The team is confused about why the lab network got the range 10.30.0.0/16. Read the configuration and the command.`,hi:`Team confuse hai ki lab network ko range 10.30.0.0/16 kyun mili. Configuration aur command padho.`},out:`Reference configuration (not run in the simulator)

variables.tf:    default  = "10.20.0.0/16"
terraform.tfvars: vpc_cidr = "10.25.0.0/16"
command:          terraform plan -var "vpc_cidr=10.30.0.0/16"`,q:{en:`Which value is used?`,hi:`Kaunsi value use hoti hai?`},o:[{en:`10.20.0.0/16, the default always wins`,hi:`10.20.0.0/16, default hamesha jeetta hai`},{en:`10.25.0.0/16, the tfvars file`,hi:`10.25.0.0/16, tfvars file`},{en:`Terraform asks which one to use`,hi:`Terraform poochta hai kaunsi use karni hai`},{en:`10.30.0.0/16, the command line value`,hi:`10.30.0.0/16, command line value`}],a:3,w:{en:`The command line overrides tfvars, which overrides the default in the variable declaration.`,hi:`Command line tfvars ko override karti hai, jo variable declaration ke default ko override karti hai.`}},{title:{en:`A secret in the repository`,hi:`Repository mein secret`},ticket:{en:`A reviewer finds this in a pull request. Everyone can read the repository. How should the engineer fix it?`,hi:`Reviewer ko pull request mein yeh milta hai. Repository sab padh sakte hain. Engineer ko ise kaise theek karna chahiye?`},out:`Reference configuration (not run in the simulator)

provider "aws" {
  region     = "ap-south-1"
  access_key = "EXAMPLE_KEY_DO_NOT_COMMIT"
  secret_key = "EXAMPLE_SECRET_DO_NOT_COMMIT"
}`,q:{en:`What is the correct response?`,hi:`Sahi jawab kya hai?`},o:[{en:`Leave it, the repository is private`,hi:`Rehne do, repository private hai`},{en:`Remove the keys from code, supply credentials by environment variables or a role, and revoke the exposed key`,hi:`Code se keys hatao, credentials environment variables ya role se do, aur expose hui key revoke karo`},{en:`Rename the variables`,hi:`Variables ka naam badlo`},{en:`Encrypt the file with a zip password`,hi:`File ko zip password se encrypt karo`}],a:1,w:{en:`Secrets in code live in Git history forever. Remove them, use environment variables, a role or a secret store, and revoke any key that was exposed.`,hi:`Code ke secrets Git history mein hamesha rehte hain. Unhe hatao, environment variables, role ya secret store use karo, aur expose hui kisi bhi key ko revoke karo.`}},{title:{en:`for_each and the third subnet`,hi:`for_each aur teesra subnet`},ticket:{en:`The team wants to add a management subnet. They have the configuration below. What is the smallest correct change?`,hi:`Team management subnet jodna chahti hai. Unke paas neeche ki configuration hai. Sabse chhota sahi change kya hai?`},out:`Reference configuration (not run in the simulator)

variable "subnets" {
  default = {
    users   = "10.20.1.0/24"
    servers = "10.20.2.0/24"
  }
}

resource "aws_subnet" "branch" {
  for_each   = var.subnets
  vpc_id     = aws_vpc.branch.id
  cidr_block = each.value
}`,q:{en:`What should they do?`,hi:`Unhe kya karna chahiye?`},o:[{en:`Copy the whole resource block three times`,hi:`Poora resource block teen baar copy karo`},{en:`Add one entry such as mgmt = "10.20.3.0/24" to the map and run plan`,hi:`Map mein ek entry jaise mgmt = "10.20.3.0/24" jodo aur plan chalao`},{en:`Destroy the VPC and rebuild`,hi:`VPC destroy karke rebuild karo`},{en:`Edit the state file`,hi:`State file edit karo`}],a:1,w:{en:`for_each creates one object per map entry. A new entry creates exactly one new subnet and leaves the others untouched.`,hi:`for_each map ki har entry ke liye ek object banata hai. Nayi entry theek ek naya subnet banati hai aur baaki ko chhodti hai.`}},{title:{en:`A manual change shows up in the plan`,hi:`Manual change plan mein dikhta hai`},ticket:{en:`The scheduled plan, which is normally empty, now proposes one in-place update. The code has not changed for a week. Description of the plan: one tag on the VPC will be removed.`,hi:`Scheduled plan, jo aam taur par khaali hota hai, ab ek in-place update propose karta hai. Code hafte bhar se nahi badla. Plan ka vivaran: VPC ka ek tag hataya jayega.`},out:`Plan description (not real tool output):
  object   : aws_vpc.branch
  action   : update in place
  argument : tags, one key will be removed
  code change in the last 7 days: none`,q:{en:`What is the most likely explanation?`,hi:`Sabse sambhavit explanation kya hai?`},o:[{en:`A provider bug`,hi:`Provider bug`},{en:`The state file is too old`,hi:`State file bahut purani hai`},{en:`Drift: someone added the tag by hand outside Terraform`,hi:`Drift: kisi ne Terraform ke bahar haath se tag joda`},{en:`The plan command changed something`,hi:`Plan command ne kuch badla`}],a:2,w:{en:`Code is unchanged yet reality differs, so the real object was modified outside Terraform. Decide whether to add the tag to code or let apply remove it.`,hi:`Code nahi badla par reality alag hai, matlab asli object Terraform ke bahar badla. Tay karo tag code mein jodna hai ya apply se hatwana hai.`}},{title:{en:`Two engineers, two applies`,hi:`Do engineers, do applies`},ticket:{en:`Two engineers ran apply for the same network from different laptops, each with local state. The cloud now has duplicate subnets. Description of the setup below.`,hi:`Do engineers ne ek hi network ke liye alag laptops se apply chalaya, har ek ke paas local state. Cloud mein ab duplicate subnets hain. Setup ka vivaran neeche.`},out:`Setup description (not real tool output):
  laptop A : terraform.tfstate on disk, applied at 10:02
  laptop B : terraform.tfstate on disk, applied at 10:04
  backend  : none (local)
  lock     : none`,q:{en:`Which change prevents this next time?`,hi:`Agli baar yeh kya rokta hai?`},o:[{en:`A shared remote backend with locking, and applies only from the pipeline`,hi:`Locking wala shared remote backend, aur applies sirf pipeline se`},{en:`Ask engineers to apply faster`,hi:`Engineers se tez apply karne ko kaho`},{en:`Copy the state file by email`,hi:`State file email se copy karo`},{en:`Disable plan`,hi:`Plan disable karo`}],a:0,w:{en:`Each laptop believed it owned nothing yet. A shared locked remote state gives one record of reality and blocks concurrent applies.`,hi:`Har laptop ne maana ki abhi kuch uska nahi. Shared locked remote state reality ka ek record deti hai aur concurrent applies rokti hai.`}}];export{e as default};