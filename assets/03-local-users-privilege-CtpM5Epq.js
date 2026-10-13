var e={id:`local-users`,h:{en:`Local usernames, secrets and privilege levels`,hi:`Local usernames, secrets aur privilege levels`},body:{en:`
<p>In a well-run office every employee has a personal badge. The badge opens the doors that person needs and nothing more, and when someone leaves, only their badge is cancelled. A shared line password is the opposite: one key for everybody, no record of who used it, and changing it means telling every engineer the new one. <b>Local usernames</b> are the first step to personal badges on a Cisco device.</p>

<h3>Creating a local user</h3>
<pre class="code">EDGE(config)# username netadmin privilege 15 secret N0c!Admin26
EDGE(config)# username helpdesk privilege 1 algorithm-type scrypt secret H3lp!Desk26</pre>
<ul>
<li><b>username</b> creates an entry in the router's <b>local user database</b>, stored in the configuration.</li>
<li><b>privilege 15</b> sets the level the user lands in after login (default 1 if omitted).</li>
<li><b>secret</b> stores a one-way hash (type 9 on current IOS, or type 5 on old releases). <b>password</b> would store clear text or type 7, so never use it for users.</li>
<li><b>algorithm-type scrypt</b> forces type 9 explicitly.</li>
</ul>

<h3>Telling the lines to use the database: login local</h3>
<p>A username does nothing until a line is told to ask for it. <code>login</code> asks for the line password; <code>login local</code> asks for a username and password and checks them against the local database.</p>
<pre class="code">EDGE(config)# line vty 0 4
EDGE(config-line)# login local
EDGE(config-line)# no password            <span class="c">! remove the old shared line password</span>
EDGE(config-line)# exit
EDGE(config)# line con 0
EDGE(config-line)# login local</pre>
<p>Always create at least one user <b>before</b> you apply <code>login local</code>, and keep a second session (ideally the console) open until you have tested a fresh login. If nobody exists in the database, every remote login fails with <code>% Login invalid</code>.</p>

<h3>Privilege levels</h3>
<p>IOS has 16 privilege levels, 0 to 15. Each command belongs to a level, and a user can run every command at or below their current level.</p>
<table class="cmp"><tr><th>Level</th><th>Prompt</th><th>What it allows</th></tr>
<tr><td>0</td><td><code>&gt;</code></td><td>Only a handful of commands: logout, enable, disable, help, exit</td></tr>
<tr><td>1</td><td><code>&gt;</code></td><td>User EXEC: basic show commands, ping, traceroute. Default for new sessions</td></tr>
<tr><td>2 to 14</td><td><code>#</code></td><td>Custom levels: empty until you move commands into them</td></tr>
<tr><td>15</td><td><code>#</code></td><td>Privileged EXEC: everything, including configure terminal</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Privilege levels and login paths">
<rect x="20" y="20" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">netadmin</text><text x="100" y="58" text-anchor="middle" class="svg-muted" font-size="12">privilege 15</text>
<rect x="20" y="130" width="160" height="46" rx="8" fill="#fed7aa"/><text x="100" y="152" text-anchor="middle" class="svg-ink" font-size="13">helpdesk</text><text x="100" y="168" text-anchor="middle" class="svg-muted" font-size="12">privilege 1</text>
<rect x="250" y="130" width="140" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="158" text-anchor="middle" class="svg-accent" font-size="14">EDGE&gt;</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="48" text-anchor="middle" class="svg-accent" font-size="14">EDGE#</text>
<line x1="180" y1="43" x2="470" y2="43" stroke="#64748b" stroke-width="2"/><text x="325" y="36" text-anchor="middle" class="svg-muted" font-size="12">lands directly in level 15</text>
<line x1="180" y1="153" x2="250" y2="153" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="153" x2="545" y2="66" stroke="#64748b" stroke-width="2"/><text x="505" y="130" text-anchor="middle" class="svg-muted" font-size="12">enable + enable secret</text>
</svg><p class="cap">The privilege in the username decides where the session starts. Level 1 users need the enable secret to reach level 15.</p></div>

<h3>Custom levels: giving the helpdesk just enough</h3>
<p>You can move individual commands into a middle level and give a user that level. For example, the helpdesk may clear interface counters but not configure anything:</p>
<pre class="code">EDGE(config)# privilege exec level 5 clear counters
EDGE(config)# username helpdesk privilege 5 secret H3lp!Desk26</pre>
<p>The helpdesk user now lands at level 5 and can run level 0 to 5 commands, including <code>clear counters</code>, but not <code>configure terminal</code>. This works on one device, but maintaining command lists on hundreds of routers does not scale. That is why larger networks use <b>TACACS+ command authorization</b> (chapter 7) instead.</p>

<h3>Verification</h3>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.0.12.2
Password:

EDGE# show privilege
<span class="hl">Current privilege level is 15</span>
EDGE# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:07:12
<span class="hl">*  2 vty 0     netadmin   idle                 00:00:00 10.99.99.10</span>

  Interface    User               Mode         Idle     Peer Address

EDGE# show running-config | include username
username netadmin privilege 15 secret 9 $9$vFpMRDdhjBCv5.$4qaRPfnU3JqbVzOOe3wTNPpcrmNUbFH4ZEKWrk8uIWo
username helpdesk privilege 5 secret 9 $9$Lq3mZ0cWd8Hk2F$0H1xY7uQ4nV2rS6tB9pE3kJ5wM8aC1dF4gL7hN0zR2s</pre>
<p>The <code>*</code> marks your own session, and the <b>User</b> column now shows a real name. That column is empty when everybody logs in with a shared line password.</p>

<div class="eg"><p><b>Worked example.</b> In the lab, task 2 creates <code>username netadmin privilege 15 secret N0c!Admin26</code> and <code>enable secret En@ble2026</code>. When PC-ADMIN logs in as netadmin over SSH, the prompt is immediately <code>EDGE#</code>: no enable needed, because the user's level is 15. If you had created netadmin with no privilege keyword, the prompt would be <code>EDGE&gt;</code> and <code>enable</code> would ask for En@ble2026.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Applying <code>login local</code> before any user exists and locking yourself out. Using <code>username ... password</code> (stored reversibly). Giving every user privilege 15 "to save time". Leaving the old line password configured after moving to login local. Forgetting that usernames are case-sensitive and so are secrets.</p></div>

<div class="exam"><p><b>Exam traps.</b> Default privilege for a new user and a new session is 1. Level 15 lands at <code>#</code>. <code>login</code> uses the line password; <code>login local</code> uses the local database. <code>username x secret</code> is hashed; <code>username x password</code> is not. <code>show privilege</code> shows your current level.</p></div>

<div class="scn"><h4>Who shut down the WAN interface?</h4><p>A logistics company's branch router lost its WAN link on a Saturday. The log showed <code>%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down</code> but the session had no username because everyone used the line password. The team created personal users with scrypt secrets, set <code>login local</code> on all VTY lines and turned on <code>login on-success log</code>. The next unexpected change was traced within minutes to a trainee who had typed on the wrong router, and training was fixed instead of guessing.</p><p><b>Lesson:</b> personal accounts turn "someone did something" into "this person did this at this time".</p></div>

<div class="iv"><p class="q">"How do you give a helpdesk engineer read-only access to a router?"</p><p>Strong answer: create a local user without privilege 15, for example level 1 for basic show commands, or a custom level with <code>privilege exec level N command</code> for a few extra commands, with a secret, and <code>login local</code> on the lines. For scale, use AAA with TACACS+ and command authorization so roles are defined centrally. Mention that level 15 lands directly in privileged EXEC and that level 1 users must know the enable secret to go further, which they should not.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local users give personal accountability: <code>username NAME privilege N secret PASS</code>.</li>
<li><code>login local</code> makes a line ask for username and password from the local database.</li>
<li>Levels: 0 minimal, 1 user EXEC (default), 2 to 14 custom, 15 full privileged EXEC.</li>
<li>Create users before applying login local, and keep a console session open while testing.</li>
<li>Custom levels work per device; TACACS+ command authorization scales across the network.</li>
</ul></div>
`,hi:`
<p>Achhe chalte office mein har employee ka personal badge hota hai. Badge sirf wahi darwaze kholta hai jo us insaan ko chahiye, aur jab koi chhod kar jaata hai to sirf uska badge cancel hota hai. Shared line password iska ulta hai: sabke liye ek chaabi, koi record nahi ki kisne use ki, aur badalne ka matlab har engineer ko naya batana. Cisco device par personal badges ki taraf pehla kadam <b>local usernames</b> hain.</p>

<h3>Local user banana</h3>
<pre class="code">EDGE(config)# username netadmin privilege 15 secret N0c!Admin26
EDGE(config)# username helpdesk privilege 1 algorithm-type scrypt secret H3lp!Desk26</pre>
<ul>
<li><b>username</b> router ke <b>local user database</b> mein entry banata hai, jo configuration mein store hota hai.</li>
<li><b>privilege 15</b> woh level set karta hai jismein user login ke baad pahunchta hai (na likho to default 1).</li>
<li><b>secret</b> one-way hash store karta hai (current IOS par type 9, purane releases par type 5). <b>password</b> clear text ya type 7 store karega, isliye users ke liye kabhi use mat karo.</li>
<li><b>algorithm-type scrypt</b> explicitly type 9 force karta hai.</li>
</ul>

<h3>Lines ko database use karne ko bolna: login local</h3>
<p>Username tab tak kuch nahi karta jab tak kisi line ko use maangne ko na bola jaaye. <code>login</code> line password maangta hai; <code>login local</code> username aur password maangta hai aur unhe local database se check karta hai.</p>
<pre class="code">EDGE(config)# line vty 0 4
EDGE(config-line)# login local
EDGE(config-line)# no password            <span class="c">! purana shared line password hatao</span>
EDGE(config-line)# exit
EDGE(config)# line con 0
EDGE(config-line)# login local</pre>
<p><code>login local</code> lagane se <b>pehle</b> hamesha kam se kam ek user banao, aur jab tak fresh login test na kar lo, ek doosra session (ideally console) khula rakho. Agar database mein koi nahi hai, to har remote login <code>% Login invalid</code> ke saath fail hota hai.</p>

<h3>Privilege levels</h3>
<p>IOS mein 16 privilege levels hain, 0 se 15. Har command ek level ki hoti hai, aur user apne current level ya usse neeche ki har command chala sakta hai.</p>
<table class="cmp"><tr><th>Level</th><th>Prompt</th><th>Kya allow karta hai</th></tr>
<tr><td>0</td><td><code>&gt;</code></td><td>Sirf gini chuni commands: logout, enable, disable, help, exit</td></tr>
<tr><td>1</td><td><code>&gt;</code></td><td>User EXEC: basic show commands, ping, traceroute. Naye sessions ka default</td></tr>
<tr><td>2 se 14</td><td><code>#</code></td><td>Custom levels: jab tak aap commands inmein move na karo, khaali</td></tr>
<tr><td>15</td><td><code>#</code></td><td>Privileged EXEC: sab kuch, configure terminal bhi</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Privilege levels aur login ke raaste">
<rect x="20" y="20" width="160" height="46" rx="8" fill="#bbf7d0"/><text x="100" y="42" text-anchor="middle" class="svg-ink" font-size="13">netadmin</text><text x="100" y="58" text-anchor="middle" class="svg-muted" font-size="12">privilege 15</text>
<rect x="20" y="130" width="160" height="46" rx="8" fill="#fed7aa"/><text x="100" y="152" text-anchor="middle" class="svg-ink" font-size="13">helpdesk</text><text x="100" y="168" text-anchor="middle" class="svg-muted" font-size="12">privilege 1</text>
<rect x="250" y="130" width="140" height="46" rx="8" fill="#e2e8f0"/><text x="320" y="158" text-anchor="middle" class="svg-accent" font-size="14">EDGE&gt;</text>
<rect x="470" y="20" width="150" height="46" rx="8" fill="#bae6fd"/><text x="545" y="48" text-anchor="middle" class="svg-accent" font-size="14">EDGE#</text>
<line x1="180" y1="43" x2="470" y2="43" stroke="#64748b" stroke-width="2"/><text x="325" y="36" text-anchor="middle" class="svg-muted" font-size="12">seedha level 15 mein</text>
<line x1="180" y1="153" x2="250" y2="153" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="153" x2="545" y2="66" stroke="#64748b" stroke-width="2"/><text x="505" y="130" text-anchor="middle" class="svg-muted" font-size="12">enable + enable secret</text>
</svg><p class="cap">Username ka privilege decide karta hai ki session kahan se shuru ho. Level 1 users ko level 15 tak jaane ke liye enable secret chahiye.</p></div>

<h3>Custom levels: helpdesk ko bas utna jitna chahiye</h3>
<p>Aap individual commands ko beech ke level mein move karke user ko woh level de sakte ho. Jaise, helpdesk interface counters clear kar sake lekin kuch configure na kar sake:</p>
<pre class="code">EDGE(config)# privilege exec level 5 clear counters
EDGE(config)# username helpdesk privilege 5 secret H3lp!Desk26</pre>
<p>Ab helpdesk user level 5 par pahunchta hai aur level 0 se 5 tak ki commands chala sakta hai, <code>clear counters</code> samet, lekin <code>configure terminal</code> nahi. Yeh ek device par chalta hai, lekin sainkdon routers par command lists maintain karna scale nahi karta. Isiliye bade networks iski jagah <b>TACACS+ command authorization</b> (chapter 7) use karte hain.</p>

<h3>Verification</h3>
<pre class="out">PC-ADMIN&gt; ssh -l netadmin 10.0.12.2
Password:

EDGE# show privilege
<span class="hl">Current privilege level is 15</span>
EDGE# show users
    Line       User       Host(s)              Idle       Location
   0 con 0                idle                 00:07:12
<span class="hl">*  2 vty 0     netadmin   idle                 00:00:00 10.99.99.10</span>

  Interface    User               Mode         Idle     Peer Address

EDGE# show running-config | include username
username netadmin privilege 15 secret 9 $9$vFpMRDdhjBCv5.$4qaRPfnU3JqbVzOOe3wTNPpcrmNUbFH4ZEKWrk8uIWo
username helpdesk privilege 5 secret 9 $9$Lq3mZ0cWd8Hk2F$0H1xY7uQ4nV2rS6tB9pE3kJ5wM8aC1dF4gL7hN0zR2s</pre>
<p><code>*</code> aapka apna session mark karta hai, aur <b>User</b> column mein ab asli naam dikhta hai. Jab sab shared line password se login karte hain to yeh column khaali rehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab mein task 2 <code>username netadmin privilege 15 secret N0c!Admin26</code> aur <code>enable secret En@ble2026</code> banata hai. Jab PC-ADMIN SSH par netadmin ke roop mein login karta hai, prompt turant <code>EDGE#</code> hota hai: enable ki zaroorat nahi, kyunki user ka level 15 hai. Agar aapne netadmin ko bina privilege keyword ke banaya hota, to prompt <code>EDGE&gt;</code> hota aur <code>enable</code> En@ble2026 maangta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Koi user bane bina <code>login local</code> lagana aur khud ko lock out kar lena. <code>username ... password</code> use karna (reversible store hota hai). "Time bachane ke liye" har user ko privilege 15 dena. Login local par jaane ke baad bhi purana line password configured chhodna. Yeh bhoolna ki usernames case-sensitive hain aur secrets bhi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Naye user aur naye session ka default privilege 1 hai. Level 15 <code>#</code> par pahunchta hai. <code>login</code> line password use karta hai; <code>login local</code> local database. <code>username x secret</code> hashed hai; <code>username x password</code> nahi. <code>show privilege</code> aapka current level dikhata hai.</p></div>

<div class="scn"><h4>WAN interface kisne band kiya?</h4><p>Ek logistics company ke branch router ka WAN link Saturday ko chala gaya. Log mein <code>%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down</code> dikha lekin session ka koi username nahi tha kyunki sab line password use karte the. Team ne scrypt secrets ke saath personal users banaye, saari VTY lines par <code>login local</code> lagaya aur <code>login on-success log</code> on kiya. Agla unexpected change minutes mein ek trainee tak trace hua jisne galat router par type kar diya tha, aur andaaza lagane ki jagah training theek ki gayi.</p><p><b>Seekh:</b> personal accounts "kisi ne kuch kiya" ko "is insaan ne is waqt yeh kiya" mein badal dete hain.</p></div>

<div class="iv"><p class="q">"Helpdesk engineer ko router par read-only access kaise doge?"</p><p>Strong answer: privilege 15 ke bina local user banao, jaise basic show commands ke liye level 1, ya kuch extra commands ke liye <code>privilege exec level N command</code> wala custom level, secret ke saath, aur lines par <code>login local</code>. Scale ke liye TACACS+ ke saath AAA aur command authorization use karo taaki roles centrally define hon. Batao ki level 15 seedha privileged EXEC mein pahunchta hai aur level 1 users ko aage jaane ke liye enable secret pata hona chahiye, jo unhe nahi pata hona chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Local users personal accountability dete hain: <code>username NAME privilege N secret PASS</code>.</li>
<li><code>login local</code> line ko local database se username aur password maangne ko kehta hai.</li>
<li>Levels: 0 minimal, 1 user EXEC (default), 2 se 14 custom, 15 poora privileged EXEC.</li>
<li>Login local lagane se pehle users banao, aur test karte waqt console session khula rakho.</li>
<li>Custom levels har device par kaam karte hain; TACACS+ command authorization poore network mein scale karta hai.</li>
</ul></div>
`}};export{e as default};