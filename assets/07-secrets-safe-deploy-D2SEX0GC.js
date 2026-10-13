var e={id:`secrets-safe-deploy`,h:{en:`Secrets and safe deploys: masked variables, pilots, rollback`,hi:`Secrets aur safe deploys: masked variables, pilots, rollback`},body:{en:`

<p><b>One idea in this chapter:</b> a pipeline holds the keys to your network, so protect the keys and limit the damage a bad change can do. Three habits: keep secrets out of Git, deploy to a small group first, and be able to go back.</p>

<h3>Why a password in the repository is a leak</h3>
<p>Git remembers everything. If a password is committed once, it stays in the history even after you delete the line. Every colleague, every clone and every backup has a copy. The lab file <code>deploy.py</code> has the switch password typed in, which is fine only because it is a throwaway lab. Treat it as the example of what <b>not</b> to do.</p>

<h3>The safe pattern: variables set outside the repository</h3>
<p>Reference configuration (not run in the simulator) The script reads its secrets from <b>environment variables</b>. The CI server stores the values in its settings and passes them to the job at run time:</p>
<pre class="code"><span class="c"># Safer version of the connection line: read the secret from the environment</span>
import os
from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host=os.environ["SWITCH_HOST"],
    username=os.environ["SWITCH_USER"],
    password=os.environ["SWITCH_PASS"],   <span class="c"># set in CI settings, never in the repository</span>
)</pre>
<pre class="code">push-vlans:
  stage: deploy
  when: manual
  script:
    - python3 deploy.py     <span class="c"># the job reads SWITCH_HOST, SWITCH_USER, SWITCH_PASS</span></pre>
<ul>
<li>In the project settings under CI/CD variables you create <code>SWITCH_HOST</code>, <code>SWITCH_USER</code> and <code>SWITCH_PASS</code>.</li>
<li>A <b>masked</b> variable is hidden in job logs: if the value is accidentally printed, the log shows a mask instead.</li>
<li>A <b>protected</b> variable is available only to protected branches such as main, so a random experimental branch cannot use the production password.</li>
<li>The values are never in any file of the repository. If a person leaves, you rotate the secret in one place.</li>
</ul>
<p>The same idea appears in the Ansible chapter as Ansible Vault: the data is stored encrypted, or outside the repository, and the tool decrypts it only when it runs. A third option is a central secrets manager that the job asks at run time. For the exam, remember the principle, not one product: <b>secrets are separate from code</b>.</p>
<div class="warn"><p><b>If a secret is ever committed.</b> Deleting the line is not enough. Change the password on the device immediately (rotate it), tell your security team, and only then clean the history. Assume the old value is known to everyone who could read the repository.</p></div>

<h3>Deploy small first: pilot, then wave</h3>
<p>A pipeline can push the same change to many sites very quickly. A mistake is then copied just as quickly. Reduce the blast radius:</p>
<table class="cmp"><tr><th>Wave</th><th>Where</th><th>Gate</th></tr><tr><td>1: pilot</td><td>one lab or one low-risk store</td><td>automatic after tests, verify with show commands</td></tr><tr><td>2: small group</td><td>for example 5 stores</td><td>manual job, after pilot is confirmed</td></tr><tr><td>3: the rest</td><td>all remaining stores</td><td>manual job, inside the change window</td></tr></table>
<p>In the Narmada Retail labs each store has its own repository and one switch. Store 7 got VLANs 10, 20 and 30; store 14 got VLAN 40 for guest Wi-Fi. That is already a small, per-site deploy. In bigger estates you would also use the manual gate from the previous chapter between waves.</p>

<h3>Rollback: because everything is in Git</h3>
<p>If a deploy goes wrong, you do not edit the switch by hand in a panic. You revert the commit and let the pipeline apply the previous state. The history you learned in the Git module does the work:</p>
<pre class="code">git revert HEAD
git push origin main</pre>
<p>The revert creates a new commit that undoes the last one, and the push triggers a pipeline that deploys the older data. There is a limit to be honest about: the deploy script in the lab adds VLANs. A revert that removes a VLAN from <code>vlans.yml</code> does not by itself delete that VLAN from the switch. A real rollback plan must say how removals are applied, for example with a separate cleanup job, and must be rehearsed in a lab.</p>

<h3>Audit: who changed what, and when</h3>
<p>The commit log says who proposed the change and why. The pipeline number says what was checked. The job log says what the script did on the device. Together they are the evidence trail that a manual console session never gives you. Keep the commit message meaningful: "Add VLAN 40 for guest Wi-Fi, store 14" tells the whole story.</p>

<div class="eg"><p><b>Worked example.</b> You are asked to add the real password to deploy.py to make the job work. Instead you ask the platform team for masked, protected CI variables, change the script to read them from the environment, and make the deploy job manual. The pilot store deploys first, the team verifies with show vlan brief, and the other stores follow in the change window.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Pasting a password into the repository "just for now". Printing variables in a job log with echo. Deploying to all sites in one go on the first day. Rolling back by hand on the device, so the repository no longer matches the network.</p></div>
<div class="exam"><p><b>Exam trap.</b> Secrets belong in masked and protected CI variables, a vault or a secrets manager, never in the repository. A revert is a new commit that undoes an old one. Staged deployments reduce risk.</p></div>

<div class="scn"><h4>The password in history</h4><p>A new engineer committed deploy.py with the lab password and pushed it to a shared project. The security tool flagged it in minutes. The team rotated the real password first, then moved the values into masked CI variables, and only then removed the line from the files. They also wrote one paragraph on the team page: secrets are variables, never text in the repository.</p><p><b>Lesson:</b> if a secret is committed, rotate it first; deleting the line is not a fix.</p></div>
<div class="iv"><p class="q">"How do you handle credentials in a CI/CD pipeline?"</p><p>I keep them out of the repository. The job reads them from environment variables that are defined in the CI settings as masked and, for production, protected. Masked values are hidden in logs and protected values are available only on protected branches. If a secret was ever committed, I rotate it immediately.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Git keeps history, so a committed password is a leak even after deletion.</li><li>Use masked and protected CI variables (reference) or a vault; the script reads os.environ.</li><li>Deploy in waves: pilot, small group, the rest, with a manual gate.</li><li>Roll back with git revert and a new pipeline, but plan how removals are applied.</li><li>Commit log, pipeline number and job log together form the audit trail.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> pipeline ke paas aapke network ki chabiyan hoti hain, isliye chabiyon ko surakshit rakho aur kharab change ka nuksan seemit rakho. Teen aadatein: secrets Git se bahar rakho, pehle chhote group par deploy karo, aur wapas jaane ki kshamta rakho.</p>

<h3>Repository mein password leak kyun hai</h3>
<p>Git sab kuch yaad rakhta hai. Agar password ek baar commit ho gaya, to line delete karne ke baad bhi woh history mein rehta hai. Har colleague, har clone aur har backup ke paas copy hoti hai. Lab file <code>deploy.py</code> mein switch ka password likha hai, jo sirf isliye theek hai kyunki yeh throwaway lab hai. Ise <b>kya nahi karna</b> ke example ki tarah lo.</p>

<h3>Safe pattern: repository ke bahar set kiye variables</h3>
<p>Reference configuration (not run in the simulator) Script apne secrets <b>environment variables</b> se padhti hai. CI server values apni settings mein rakhta hai aur run time par job ko deta hai:</p>
<pre class="code"><span class="c"># Safer version of the connection line: read the secret from the environment</span>
import os
from nkmiko import ConnectHandler

conn = ConnectHandler(
    device_type="nk_ios",
    host=os.environ["SWITCH_HOST"],
    username=os.environ["SWITCH_USER"],
    password=os.environ["SWITCH_PASS"],   <span class="c"># set in CI settings, never in the repository</span>
)</pre>
<pre class="code">push-vlans:
  stage: deploy
  when: manual
  script:
    - python3 deploy.py     <span class="c"># the job reads SWITCH_HOST, SWITCH_USER, SWITCH_PASS</span></pre>
<ul>
<li>Project settings mein CI/CD variables ke neeche aap <code>SWITCH_HOST</code>, <code>SWITCH_USER</code> aur <code>SWITCH_PASS</code> banate ho.</li>
<li><b>Masked</b> variable job logs mein chhupa rehta hai: agar value galti se print ho jaye, to log mein mask dikhta hai.</li>
<li><b>Protected</b> variable sirf protected branches, jaise main, ke liye milta hai, isliye koi random experimental branch production password use nahi kar sakti.</li>
<li>Values kabhi repository ki kisi file mein nahi hoti. Agar koi insaan chhod de, to aap secret ek jagah rotate kar dete ho.</li>
</ul>
<p>Yahi idea Ansible chapter mein Ansible Vault ke roop mein aata hai: data encrypted ya repository ke bahar rakha jaata hai, aur tool use sirf chalte waqt decrypt karta hai. Teesra option central secrets manager hai jisse job run time par maangta hai. Exam ke liye principle yaad rakho, koi ek product nahi: <b>secrets code se alag hote hain</b>.</p>
<div class="warn"><p><b>Agar secret kabhi commit ho jaye.</b> Line delete karna kaafi nahi. Device par password turant badlo (rotate), security team ko batao, aur tabhi history saaf karo. Maan lo ki purani value har us insaan ko pata hai jo repository padh sakta tha.</p></div>

<h3>Pehle chhota deploy: pilot, phir wave</h3>
<p>Pipeline ek hi change bahut saari sites par bahut tezi se push kar sakti hai. Galti bhi utni hi tezi se copy ho jaati hai. Blast radius kam karo:</p>
<table class="cmp"><tr><th>Wave</th><th>Kahan</th><th>Gate</th></tr><tr><td>1: pilot</td><td>ek lab ya ek low-risk store</td><td>tests ke baad automatic, show commands se verify</td></tr><tr><td>2: chhota group</td><td>jaise 5 stores</td><td>manual job, pilot confirm hone ke baad</td></tr><tr><td>3: baaki</td><td>bache hue saare stores</td><td>manual job, change window ke andar</td></tr></table>
<p>Narmada Retail ke labs mein har store ka apna repository aur ek switch hai. Store 7 ko VLAN 10, 20 aur 30 mile; store 14 ko guest Wi-Fi ke liye VLAN 40. Yeh pehle se hi chhota, per-site deploy hai. Bade estates mein aap waves ke beech pichhle chapter ka manual gate bhi lagaoge.</p>

<h3>Rollback: kyunki sab kuch Git mein hai</h3>
<p>Agar deploy galat ho jaye, to ghabrahat mein switch par haath se edit nahi karte. Commit revert karte ho aur pipeline ko pichhla state lagane dete ho. Git module mein seekhi history kaam karti hai:</p>
<pre class="code">git revert HEAD
git push origin main</pre>
<p>Revert ek naya commit banata hai jo pichhle ko undo karta hai, aur push ek pipeline trigger karta hai jo purana data deploy karti hai. Ek had ke baare mein imaandaar rehna zaroori hai: lab ki deploy script VLANs jodti hai. <code>vlans.yml</code> se VLAN hatane wala revert apne aap switch se woh VLAN delete nahi karta. Asli rollback plan mein batana hoga ki removals kaise lagte hain, jaise alag cleanup job se, aur use lab mein rehearse karna hoga.</p>

<h3>Audit: kisne kya badla, kab</h3>
<p>Commit log batata hai kisne change propose kiya aur kyun. Pipeline number batata hai kya check hua. Job log batata hai script ne device par kya kiya. Milkar yeh woh evidence trail hain jo manual console session kabhi nahi deta. Commit message arth wala rakho: "Add VLAN 40 for guest Wi-Fi, store 14" poori kahani bata deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapse kaha jaata hai ki job chalane ke liye deploy.py mein asli password daal do. Aap ke bajaye platform team se masked, protected CI variables maangte ho, script ko environment se padhne ke liye badalte ho, aur deploy job manual banate ho. Pilot store pehle deploy hota hai, team show vlan brief se verify karti hai, aur baaki stores change window mein aate hain.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Password ko "bas abhi ke liye" repository mein paste karna. Job log mein echo se variables print karna. Pehle hi din ek saath saari sites par deploy karna. Device par haath se rollback karna, jisse repository ab network se match nahi karti.</p></div>
<div class="exam"><p><b>Exam trap.</b> Secrets masked aur protected CI variables, vault ya secrets manager mein rehte hain, repository mein kabhi nahi. Revert ek naya commit hai jo purane ko undo karta hai. Staged deployments risk kam karte hain.</p></div>

<div class="scn"><h4>History mein password</h4><p>Ek naye engineer ne lab password ke saath deploy.py commit karke shared project mein push kar diya. Security tool ne minutes mein flag kiya. Team ne pehle asli password rotate kiya, phir values masked CI variables mein dali, aur tabhi files se line hatayi. Unhone team page par ek paragraph bhi likha: secrets variables hain, repository mein text nahi.</p><p><b>Lesson:</b> agar secret commit ho jaye to pehle rotate karo; line delete karna fix nahi hai.</p></div>
<div class="iv"><p class="q">"CI/CD pipeline mein credentials kaise handle karte ho?"</p><p>Main unhe repository se bahar rakhta hoon. Job unhe environment variables se padhta hai jo CI settings mein masked, aur production ke liye protected, define hote hain. Masked values logs mein chhupi rehti hain aur protected values sirf protected branches par milti hain. Agar koi secret kabhi commit ho gaya, to main use turant rotate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Git history rakhta hai, isliye commit hua password delete ke baad bhi leak hai.</li><li>Masked aur protected CI variables (reference) ya vault use karo; script os.environ padhti hai.</li><li>Waves mein deploy karo: pilot, chhota group, baaki, manual gate ke saath.</li><li>git revert aur nayi pipeline se rollback karo, par removals kaise lagte hain yeh plan karo.</li><li>Commit log, pipeline number aur job log milkar audit trail hain.</li></ul></div>

`}};export{e as default};