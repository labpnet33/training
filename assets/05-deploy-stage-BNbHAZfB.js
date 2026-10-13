var e={id:`deploy-stage`,h:{en:`The deploy stage: from green pipeline to the switch`,hi:`Deploy stage: green pipeline se switch tak`},body:{en:`

<p><b>One idea in this chapter:</b> the deploy job is just another script. It runs only when every check before it has passed, and its result is something you can verify on the device.</p>

<h3>What deploy.py does</h3>
<p>The deploy job runs <code>python3 deploy.py</code>. Read it like the test: you do not need to write it.</p>
<pre class="code"><span class="c"># deploy.py - push every VLAN from vlans.yml to the access switch over SSH</span>
import yaml
from nkmiko import ConnectHandler

with open("vlans.yml") as f:
    data = yaml.safe_load(f.read())

<span class="c"># build the config lines: "vlan 10" then " name POS" for every VLAN</span>
cfg = []
for v in data["vlans"]:
    cfg.append(f"vlan {v['id']}")
    cfg.append(f" name {v['name']}")

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.11", username="netops", password="[lab-only value, omitted here]")
conn.send_config_set(cfg)
conn.save_config()
conn.disconnect()
print(f"deployed {len(data['vlans'])} VLANs to 10.99.0.11")</pre>
<ul>
<li>It reads the same <code>vlans.yml</code> that the checks approved. One file is the <b>source of truth</b>.</li>
<li>For every VLAN it builds two configuration lines: <code>vlan 10</code>, then <code>name POS</code>.</li>
<li><code>ConnectHandler</code> opens an SSH session to the access switch at 10.99.0.11. <code>send_config_set</code> types the lines in configuration mode, <code>save_config</code> saves them, and the script prints a one-line summary.</li>
</ul>
<div class="warn"><p><b>Lab-only shortcut.</b> The real file has the switch password typed inside the script. That is acceptable only in a throwaway lab. In real work a password in a repository is a leak, because every person and every copy of the repository can read it. The next chapters show the safe way: masked CI variables. The value is omitted in the listing above on purpose.</p></div>

<h3>The first push: the whole pipeline in one go</h3>
<p>In Lab 1 the file is now complete. Make the folder a repository, commit, add a remote and push. A push is what triggers the pipeline. (The lab remote has its own address; on your own network you would use an SSH remote such as <code>git@git.example:team/netcfg.git</code>.)</p>
<pre class="code">git init
git add .
git commit -m "Store 7 VLANs with CI pipeline"</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/
[main (root-commit) <span class="hl">abc4028</span>] Store 7 VLANs with CI pipeline
 4 files changed</pre>
<p>After the push, the server answers with the pipeline, line by line. This is the output of the Lab 1 run:</p>
<pre class="out">remote: Pipeline #101 created for main (abc4028)
remote:   ✔ validate   lint               passed
remote:   ✔ test       unit-test          passed
remote:   ✔ deploy     push-vlans         passed
remote: Pipeline #101 <span class="hl">passed</span> — see: ci log &lt;job&gt;</pre>
<p>Three green jobs, in order. The commit id in brackets, <code>abc4028</code>, ties the pipeline to one exact version of the files, so you can always say what was deployed.</p>

<h3>Reading the deploy log</h3>
<pre class="code">ci log push-vlans</pre>
<pre class="out">Job "push-vlans" (passed)
Running with nk-runner 17.x on shell executor
$ git checkout abc4028
$ python3 deploy.py
<span class="hl">deployed 3 VLANs to 10.99.0.11</span>
Job succeeded</pre>
<p>Notice <code>git checkout abc4028</code>: the runner first fetches the exact commit, then runs the script. The same log format appears for every job.</p>

<h3>Always verify on the device</h3>
<p>Green means "the script finished", not "the network is right". Check the switch yourself:</p>
<pre class="code">enable
show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
<span class="hl">10   POS</span>                              active    
<span class="hl">20   STAFF</span>                            active    
<span class="hl">30   CCTV</span>                             active    
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLANs 10, 20 and 30 now exist with the right names. Those are exactly the three entries in <code>vlans.yml</code>. The 1002 to 1005 lines are default VLANs that every switch of this type carries. In a real change you would also keep this output as evidence in your change record.</p>

<h3>The change flow, end to end</h3>
<table class="cmp"><tr><th>Step</th><th>Who or what</th><th>Command or result</th></tr><tr><td>1</td><td>You</td><td>edit vlans.yml, commit</td></tr><tr><td>2</td><td>You</td><td>git push origin main</td></tr><tr><td>3</td><td>Runner</td><td>lint, then unit-test</td></tr><tr><td>4</td><td>Runner</td><td>push-vlans (only if 1 to 3 are green)</td></tr><tr><td>5</td><td>You</td><td>show vlan brief to confirm</td></tr></table>
<p>Nobody typed a single command on the switch. The pipeline did it the same way every time, and the log records who and what.</p>

<div class="eg"><p><b>Worked example.</b> Store 7 in Bhopal needs VLANs 10 POS, 20 STAFF and 30 CCTV. You complete the pipeline file, push, and see pipeline #101 pass with three green jobs. ci log push-vlans shows "deployed 3 VLANs to 10.99.0.11". show vlan brief on the switch lists the three VLANs with their names.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Treating a green pipeline as proof without checking the device. Leaving a password in deploy.py and pushing it. Deploying straight to every site at once instead of one pilot first (Chapter 7).</p></div>
<div class="exam"><p><b>Exam trap.</b> The deploy stage runs last and only after earlier stages pass. The pipeline is triggered by a push. The job log names the commit it built. Credentials do not belong in the repository.</p></div>

<div class="scn"><h4>Green, but nothing changed</h4><p>A pipeline for another store turned green, yet the switch had no new VLAN. The engineer opened ci log for the deploy job and found it had printed "deployed 0 VLANs": the data file had an empty list. They added a rule to the unit test: at least one VLAN must be present. The next push failed early, as it should.</p><p><b>Lesson:</b> verify on the device, and make the test fail when the input is empty.</p></div>
<div class="iv"><p class="q">"What does a deploy job do in a network pipeline?"</p><p>It runs only after lint and tests pass, and applies the approved data to the device, for example with a script that opens SSH and sends configuration. It logs the commit it deployed. I confirm the result on the device with a show command, and I keep credentials in masked CI variables instead of the repository.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>The deploy job is a script like any other, running last.</li><li>deploy.py reads vlans.yml and sends vlan and name lines over SSH.</li><li>A push triggers the pipeline; the output lists each job with passed or failed.</li><li>ci log JOB shows the exact commit and the script output.</li><li>Verify with show vlan brief; never trust green alone.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> deploy job bhi bas ek aur script hai. Yeh tab hi chalta hai jab usse pehle ke saare checks pass ho chuke hon, aur uska result aap device par verify kar sakte ho.</p>

<h3>deploy.py kya karta hai</h3>
<p>Deploy job <code>python3 deploy.py</code> chalata hai. Ise test ki tarah padho: likhna zaroori nahi.</p>
<pre class="code"><span class="c"># deploy.py - push every VLAN from vlans.yml to the access switch over SSH</span>
import yaml
from nkmiko import ConnectHandler

with open("vlans.yml") as f:
    data = yaml.safe_load(f.read())

<span class="c"># build the config lines: "vlan 10" then " name POS" for every VLAN</span>
cfg = []
for v in data["vlans"]:
    cfg.append(f"vlan {v['id']}")
    cfg.append(f" name {v['name']}")

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.11", username="netops", password="[lab-only value, omitted here]")
conn.send_config_set(cfg)
conn.save_config()
conn.disconnect()
print(f"deployed {len(data['vlans'])} VLANs to 10.99.0.11")</pre>
<ul>
<li>Yeh wahi <code>vlans.yml</code> padhta hai jise checks ne approve kiya. Ek file <b>source of truth</b> hai.</li>
<li>Har VLAN ke liye do configuration lines banata hai: <code>vlan 10</code>, phir <code>name POS</code>.</li>
<li><code>ConnectHandler</code> access switch 10.99.0.11 par SSH session kholta hai. <code>send_config_set</code> lines configuration mode mein type karta hai, <code>save_config</code> unhe save karta hai, aur script ek line ka summary print karti hai.</li>
</ul>
<div class="warn"><p><b>Lab-only shortcut.</b> Asli file mein switch ka password script ke andar likha hai. Yeh sirf throwaway lab mein theek hai. Asli kaam mein repository mein password ek leak hai, kyunki har insaan aur repository ki har copy use padh sakti hai. Agle chapters safe tareeka dikhate hain: masked CI variables. Upar ki listing mein value jaanbujhkar hata di gayi hai.</p></div>

<h3>Pehla push: poori pipeline ek saath</h3>
<p>Lab 1 mein file ab poori hai. Folder ko repository banao, commit karo, remote jodo aur push karo. Push hi pipeline trigger karta hai. (Lab remote ka apna address hai; apne network mein aap SSH remote jaise <code>git@git.example:team/netcfg.git</code> use karoge.)</p>
<pre class="code">git init
git add .
git commit -m "Store 7 VLANs with CI pipeline"</pre>
<pre class="out">Initialized empty Git repository in /home/netops/.git/
[main (root-commit) <span class="hl">abc4028</span>] Store 7 VLANs with CI pipeline
 4 files changed</pre>
<p>Push ke baad server pipeline ke saath line by line jawab deta hai. Yeh Lab 1 run ka output hai:</p>
<pre class="out">remote: Pipeline #101 created for main (abc4028)
remote:   ✔ validate   lint               passed
remote:   ✔ test       unit-test          passed
remote:   ✔ deploy     push-vlans         passed
remote: Pipeline #101 <span class="hl">passed</span> — see: ci log &lt;job&gt;</pre>
<p>Teen green jobs, order mein. Bracket mein commit id <code>abc4028</code> pipeline ko files ke ek exact version se jodta hai, taaki aap hamesha bata sako ki kya deploy hua.</p>

<h3>Deploy log padhna</h3>
<pre class="code">ci log push-vlans</pre>
<pre class="out">Job "push-vlans" (passed)
Running with nk-runner 17.x on shell executor
$ git checkout abc4028
$ python3 deploy.py
<span class="hl">deployed 3 VLANs to 10.99.0.11</span>
Job succeeded</pre>
<p><code>git checkout abc4028</code> dekho: runner pehle exact commit lata hai, phir script chalata hai. Har job ka log isi format mein aata hai.</p>

<h3>Hamesha device par verify karo</h3>
<p>Green ka matlab "script khatam hui", "network sahi hai" nahi. Switch khud check karo:</p>
<pre class="code">enable
show vlan brief</pre>
<pre class="out">VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Gi0/0, Gi0/1, Gi0/2, Gi0/3
                                                Gi0/4, Gi0/5, Gi0/6, Gi0/7
                                                Gi1/0, Gi1/1, Gi1/2, Gi1/3
                                                Gi1/4, Gi1/5, Gi1/6, Gi1/7
<span class="hl">10   POS</span>                              active    
<span class="hl">20   STAFF</span>                            active    
<span class="hl">30   CCTV</span>                             active    
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup </pre>
<p>VLAN 10, 20 aur 30 ab sahi naamon ke saath maujood hain. Yeh bilkul wahi teen entries hain jo <code>vlans.yml</code> mein hain. 1002 se 1005 wali lines default VLANs hain jo is type ke har switch mein hoti hain. Asli change mein aap yeh output change record mein saboot ke roop mein rakhoge.</p>

<h3>Change ka flow, shuru se aakhir tak</h3>
<table class="cmp"><tr><th>Step</th><th>Kaun</th><th>Command ya result</th></tr><tr><td>1</td><td>Aap</td><td>vlans.yml edit, commit</td></tr><tr><td>2</td><td>Aap</td><td>git push origin main</td></tr><tr><td>3</td><td>Runner</td><td>lint, phir unit-test</td></tr><tr><td>4</td><td>Runner</td><td>push-vlans (sirf agar 1 se 3 green hon)</td></tr><tr><td>5</td><td>Aap</td><td>confirm ke liye show vlan brief</td></tr></table>
<p>Switch par kisi ne ek bhi command type nahi ki. Pipeline ne har baar ek hi tarah kiya, aur log record rakhta hai ki kisne kya kiya.</p>

<div class="eg"><p><b>Worked example.</b> Bhopal ke store 7 ko VLAN 10 POS, 20 STAFF aur 30 CCTV chahiye. Aap pipeline file poori karte ho, push karte ho, aur pipeline #101 teen green jobs ke saath pass hoti dikhti hai. ci log push-vlans "deployed 3 VLANs to 10.99.0.11" dikhata hai. Switch par show vlan brief teeno VLANs unke naamon ke saath list karta hai.</p></div>
<div class="warn"><p><b>Common beginner mistakes.</b> Device dekhe bina green pipeline ko saboot maan lena. deploy.py mein password chhodkar push kar dena. Pehle ek pilot ki jagah ek saath har site par deploy karna (Chapter 7).</p></div>
<div class="exam"><p><b>Exam trap.</b> Deploy stage aakhir mein chalta hai aur sirf pehle ke stages pass hone par. Pipeline push se trigger hoti hai. Job log us commit ka naam batata hai jo bana. Credentials repository mein nahi rakhte.</p></div>

<div class="scn"><h4>Green, par kuch badla nahi</h4><p>Doosre store ki pipeline green ho gayi, par switch par naya VLAN nahi tha. Engineer ne deploy job ka ci log khola aur dekha ki usne "deployed 0 VLANs" print kiya tha: data file mein list khaali thi. Unhone unit test mein rule jodha: kam se kam ek VLAN hona chahiye. Agla push jaisa hona chahiye tha waise jaldi fail hua.</p><p><b>Lesson:</b> device par verify karo, aur input khaali ho to test fail karao.</p></div>
<div class="iv"><p class="q">"Network pipeline mein deploy job kya karta hai?"</p><p>Yeh lint aur tests pass hone ke baad hi chalta hai, aur approved data device par lagata hai, jaise ek script se jo SSH kholkar configuration bhejti hai. Yeh us commit ko log karta hai jo deploy hua. Main device par show command se result confirm karta hoon, aur credentials repository ki jagah masked CI variables mein rakhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>Deploy job ek aam script hai jo aakhir mein chalti hai.</li><li>deploy.py vlans.yml padhti hai aur SSH par vlan aur name lines bhejti hai.</li><li>Push pipeline trigger karta hai; output har job ko passed ya failed ke saath list karta hai.</li><li>ci log JOB exact commit aur script output dikhata hai.</li><li>show vlan brief se verify karo; sirf green par bharosa nahi.</li></ul></div>

`}};export{e as default};