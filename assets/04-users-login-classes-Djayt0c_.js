var e={id:`users-login-classes`,h:{en:`User accounts and login classes`,hi:`User accounts aur login classes`},body:{en:`
<p>In an office, the receptionist, the accountant and the CEO hold different keys. Nobody gets the master key unless they need it. Junos works the same way: each person has an <b>account</b> and each account belongs to a <b>login class</b>, the key ring that decides which commands they may use.</p>

<h3>Accounts</h3>
<pre class="code">set system login user asha class super-user authentication plain-text-password
set system login user noc class operator authentication plain-text-password
set system login user auditor class read-only authentication plain-text-password</pre>
<p>Each <code>plain-text-password</code> prompts twice and stores a hash. A user may also have a full name (<code>full-name "NOC desk"</code>), a numeric <code>uid</code> and an SSH public key (<code>authentication ssh-ed25519 "..."</code>). Every user must have a class; otherwise the commit fails.</p>

<h3>Predefined login classes</h3>
<table class="cmp"><tr><th>Class</th><th>Permissions</th><th>What the user can do</th></tr>
<tr><td><code>super-user</code></td><td>all</td><td>everything, including configuration</td></tr>
<tr><td><code>operator</code></td><td>clear, network, reset, trace, view</td><td>look, ping, traceroute, clear counters; no configuration</td></tr>
<tr><td><code>read-only</code></td><td>view</td><td>show commands only; no ping</td></tr>
<tr><td><code>unauthorized</code></td><td>none</td><td>nothing; useful to park an account</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Login class power">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">super-user: all permissions, configure, shell, reboot</text>
<rect x="60" y="58" width="520" height="30" rx="6" fill="#fde68a"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">operator: view + network (ping) + clear + reset + trace; no configure</text>
<rect x="100" y="96" width="440" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">read-only: view (show commands only)</text>
<rect x="140" y="134" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">unauthorized: nothing</text>
</svg><p class="cap">Each class is a subset of the one above it, from most to least power.</p></div>

<h3>Permission flags</h3>
<p>A class is built from <b>permission flags</b>. The ones you must know: <code>view</code> (show operational state), <code>view-configuration</code> (show configuration), <code>network</code> (ping, traceroute, telnet, ssh), <code>configure</code> (enter configuration mode), <code>clear</code>, <code>reset</code>, <code>trace</code>, <code>interface</code>, <code>routing</code>, <code>system</code>, <code>shell</code> and <code>all</code>. The <code>secret</code> flag allows viewing passwords and keys in the configuration.</p>

<h3>Custom classes: allow and deny commands</h3>
<p>Create your own class when the predefined ones are too wide or too narrow. Regular expressions refine the flags:</p>
<pre class="code">set system login class HELPDESK permissions view
set system login class HELPDESK permissions network
set system login class HELPDESK deny-commands "^traceroute"
set system login class HELPDESK idle-timeout 15
set system login user intern class HELPDESK authentication plain-text-password</pre>
<ul>
<li><code>allow-commands</code> adds commands that the flags do not allow.</li>
<li><code>deny-commands</code> removes commands that the flags would allow. <b>Deny wins</b> over allow and over flags.</li>
<li><code>idle-timeout 15</code> logs the user out after 15 idle minutes.</li>
<li>The regex <code>"^traceroute"</code> means "a command that starts with traceroute".</li>
</ul>

<h3>Lab walkthrough: Hyderabad core router</h3>
<p>R1 (NK-HYD-CORE, 10.40.0.1/30) is managed with a shared account. R2 (NK-HYD-JUMP, 10.40.0.2/30) is the jump router. The tasks:</p>
<pre class="code">[edit]
lab@NK-HYD-CORE# set system services ssh
lab@NK-HYD-CORE# set system login user noc class operator authentication plain-text-password
lab@NK-HYD-CORE# set system login user auditor class read-only authentication plain-text-password
lab@NK-HYD-CORE# set system login class HELPDESK permissions view
lab@NK-HYD-CORE# set system login class HELPDESK permissions network
lab@NK-HYD-CORE# set system login class HELPDESK deny-commands "^traceroute"
lab@NK-HYD-CORE# set system login user intern class HELPDESK authentication plain-text-password
lab@NK-HYD-CORE# commit and-quit</pre>
<p>Then test from the jump router, as the NOC user:</p>
<pre class="code">lab@NK-HYD-JUMP&gt; ssh noc@10.40.0.1
Password:
noc@NK-HYD-CORE&gt; show interfaces terse ge-0/0/0
ge-0/0/0.0              up    up   inet     10.40.0.1/30
noc@NK-HYD-CORE&gt; clear interfaces statistics all
noc@NK-HYD-CORE&gt; configure
<span class="hl">unknown command.</span></pre>
<p>The operator can look and clear but <code>configure</code> is refused because the class has no <code>configure</code> permission. The auditor cannot even ping (<code>read-only</code> has only <code>view</code>). The intern can ping because of <code>network</code>, cannot traceroute because of the deny regex, and cannot configure.</p>
<p>To verify who is allowed what, check the active session and users: <code>show system users</code> lists logged-in users, and <code>show configuration system login</code> shows classes and accounts.</p>

<h3>Template and remote users (preview)</h3>
<p>When accounts live on a RADIUS or TACACS+ server, the router can map unknown users to a local <b>template account</b> such as <code>remote</code>, so their rights come from that class. Chapter 5 covers this.</p>

<div class="warn"><p><b>Common mistakes.</b> Giving everybody <code>super-user</code>; building a custom class and forgetting <code>permissions</code> (a class with no flags can do almost nothing); expecting <code>operator</code> to be able to configure; writing a deny regex that does not match (it must match from the start of the command, so use <code>^</code>).</p></div>
<div class="exam"><p><b>Exam trap.</b> Predefined classes: <code>super-user</code>, <code>operator</code>, <code>read-only</code>, <code>unauthorized</code>. <code>read-only</code> cannot ping; <code>operator</code> can. <code>deny-commands</code> overrides permissions. Configuration mode needs the <code>configure</code> permission.</p></div>

<div class="scn"><h4>The intern and the traceroute</h4><p>A bank's security team found that an intern had been using traceroute to map internal paths from the core router. Management did not want to remove ping, which the intern needed for fault-finding. The network team built a HELPDESK class with <code>view</code> and <code>network</code> and denied only <code>^traceroute</code>. The intern kept ping and show commands, lost traceroute, and could never reach configuration mode.</p><p><b>Lesson:</b> custom classes give least privilege without breaking a person's job.</p></div>

<div class="iv"><p class="q">"How do you give the NOC visibility but stop them changing configuration?"</p><p>I create a named account for each NOC engineer in the <code>operator</code> class, which has view, network, clear, reset and trace but no configure. If more precision is needed, I create a custom class with specific permissions and <code>allow-commands</code> or <code>deny-commands</code> regular expressions. I use <code>read-only</code> for auditors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every user needs a class; the class decides the commands.</li>
<li>Predefined: super-user (all), operator (no configure), read-only (view only), unauthorized.</li>
<li>Custom classes combine permission flags with allow-commands and deny-commands regexes.</li>
<li>Deny always wins; use <code>^</code> to anchor the regex.</li>
<li>Configuration mode requires the <code>configure</code> permission.</li>
</ul></div>
`,hi:`
<p>Office mein receptionist, accountant aur CEO ke paas alag chaabiyan hoti hain. Master key kisi ko tab tak nahi milti jab tak zaroorat na ho. Junos bhi aise hi chalta hai: har insaan ka ek <b>account</b> hota hai aur har account ek <b>login class</b> mein hota hai, jo woh key ring hai jo tay karti hai woh kaunse commands chala sakta hai.</p>

<h3>Accounts</h3>
<pre class="code">set system login user asha class super-user authentication plain-text-password
set system login user noc class operator authentication plain-text-password
set system login user auditor class read-only authentication plain-text-password</pre>
<p>Har <code>plain-text-password</code> do baar poochta hai aur hash store karta hai. User ka full name (<code>full-name "NOC desk"</code>), numeric <code>uid</code> aur SSH public key (<code>authentication ssh-ed25519 "..."</code>) bhi ho sakta hai. Har user ke liye class zaroori hai; warna commit fail hota hai.</p>

<h3>Predefined login classes</h3>
<table class="cmp"><tr><th>Class</th><th>Permissions</th><th>User kya kar sakta hai</th></tr>
<tr><td><code>super-user</code></td><td>all</td><td>sab kuch, configuration samet</td></tr>
<tr><td><code>operator</code></td><td>clear, network, reset, trace, view</td><td>dekhna, ping, traceroute, counters clear; configuration nahi</td></tr>
<tr><td><code>read-only</code></td><td>view</td><td>sirf show commands; ping nahi</td></tr>
<tr><td><code>unauthorized</code></td><td>none</td><td>kuch nahi; account park karne ke liye useful</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Login class ki taakat">
<rect x="20" y="20" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="13">super-user: all permissions, configure, shell, reboot</text>
<rect x="60" y="58" width="520" height="30" rx="6" fill="#fde68a"/><text x="320" y="78" text-anchor="middle" class="svg-ink" font-size="13">operator: view + network (ping) + clear + reset + trace; configure nahi</text>
<rect x="100" y="96" width="440" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">read-only: view (sirf show commands)</text>
<rect x="140" y="134" width="360" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="154" text-anchor="middle" class="svg-ink" font-size="13">unauthorized: kuch nahi</text>
</svg><p class="cap">Har class upar wali ka subset hai, sabse zyada se sabse kam power tak.</p></div>

<h3>Permission flags</h3>
<p>Class <b>permission flags</b> se banti hai. Jo aapko aane chahiye: <code>view</code> (operational state dekhna), <code>view-configuration</code> (configuration dekhna), <code>network</code> (ping, traceroute, telnet, ssh), <code>configure</code> (configuration mode mein jaana), <code>clear</code>, <code>reset</code>, <code>trace</code>, <code>interface</code>, <code>routing</code>, <code>system</code>, <code>shell</code> aur <code>all</code>. <code>secret</code> flag configuration mein passwords aur keys dekhne deta hai.</p>

<h3>Custom classes: allow aur deny commands</h3>
<p>Predefined classes zyada chaude ya zyada tang hon to apni class banao. Regular expressions flags ko refine karti hain:</p>
<pre class="code">set system login class HELPDESK permissions view
set system login class HELPDESK permissions network
set system login class HELPDESK deny-commands "^traceroute"
set system login class HELPDESK idle-timeout 15
set system login user intern class HELPDESK authentication plain-text-password</pre>
<ul>
<li><code>allow-commands</code> woh commands jodta hai jo flags allow nahi karte.</li>
<li><code>deny-commands</code> woh commands hata deta hai jo flags allow karte. <b>Deny jeetta hai</b> allow aur flags dono par.</li>
<li><code>idle-timeout 15</code> 15 idle minute ke baad user ko logout kar deta hai.</li>
<li>Regex <code>"^traceroute"</code> ka matlab "woh command jo traceroute se shuru ho".</li>
</ul>

<h3>Lab walkthrough: Hyderabad core router</h3>
<p>R1 (NK-HYD-CORE, 10.40.0.1/30) shared account se manage hota hai. R2 (NK-HYD-JUMP, 10.40.0.2/30) jump router hai. Tasks:</p>
<pre class="code">[edit]
lab@NK-HYD-CORE# set system services ssh
lab@NK-HYD-CORE# set system login user noc class operator authentication plain-text-password
lab@NK-HYD-CORE# set system login user auditor class read-only authentication plain-text-password
lab@NK-HYD-CORE# set system login class HELPDESK permissions view
lab@NK-HYD-CORE# set system login class HELPDESK permissions network
lab@NK-HYD-CORE# set system login class HELPDESK deny-commands "^traceroute"
lab@NK-HYD-CORE# set system login user intern class HELPDESK authentication plain-text-password
lab@NK-HYD-CORE# commit and-quit</pre>
<p>Phir jump router se NOC user ke roop mein test karo:</p>
<pre class="code">lab@NK-HYD-JUMP&gt; ssh noc@10.40.0.1
Password:
noc@NK-HYD-CORE&gt; show interfaces terse ge-0/0/0
ge-0/0/0.0              up    up   inet     10.40.0.1/30
noc@NK-HYD-CORE&gt; clear interfaces statistics all
noc@NK-HYD-CORE&gt; configure
<span class="hl">unknown command.</span></pre>
<p>Operator dekh aur clear kar sakta hai lekin <code>configure</code> refuse hota hai kyunki class mein <code>configure</code> permission nahi hai. Auditor ping bhi nahi kar sakta (<code>read-only</code> mein sirf <code>view</code>). Intern <code>network</code> ki wajah se ping kar sakta hai, deny regex ki wajah se traceroute nahi kar sakta, aur configure nahi kar sakta.</p>
<p>Kaun kya kar sakta hai verify karne ke liye: <code>show system users</code> logged-in users dikhata hai, aur <code>show configuration system login</code> classes aur accounts dikhata hai.</p>

<h3>Template aur remote users (preview)</h3>
<p>Jab accounts RADIUS ya TACACS+ server par hon, router unknown users ko local <b>template account</b> jaise <code>remote</code> se map kar sakta hai, aur unke rights us class se aate hain. Chapter 5 mein aayega.</p>

<div class="warn"><p><b>Common mistakes.</b> Sabko <code>super-user</code> dena; custom class banakar <code>permissions</code> bhool jaana (bina flags ki class lagbhag kuch nahi kar sakti); <code>operator</code> se configure ki umeed karna; aisi deny regex likhna jo match na kare (command ki shuruat se match hona chahiye, isliye <code>^</code> use karo).</p></div>
<div class="exam"><p><b>Exam trap.</b> Predefined classes: <code>super-user</code>, <code>operator</code>, <code>read-only</code>, <code>unauthorized</code>. <code>read-only</code> ping nahi kar sakta; <code>operator</code> kar sakta hai. <code>deny-commands</code> permissions ko override karta hai. Configuration mode ke liye <code>configure</code> permission chahiye.</p></div>

<div class="scn"><h4>Intern aur traceroute</h4><p>Ek bank ki security team ne paaya ki ek intern core router se traceroute karke internal paths map kar raha tha. Management ping hatana nahi chahta tha, jo intern ko fault-finding ke liye chahiye tha. Network team ne <code>view</code> aur <code>network</code> wali HELPDESK class banai aur sirf <code>^traceroute</code> deny kiya. Intern ke paas ping aur show commands rahe, traceroute gaya, aur configuration mode tak woh kabhi nahi pahunch sakta tha.</p><p><b>Lesson:</b> custom classes kaam bigaade bina least privilege deti hain.</p></div>

<div class="iv"><p class="q">"NOC ko visibility kaise doge lekin configuration badalne se kaise rokoge?"</p><p>Har NOC engineer ke liye <code>operator</code> class mein named account banata hoon, jisme view, network, clear, reset aur trace hain lekin configure nahi. Zyada precision chahiye to specific permissions aur <code>allow-commands</code> ya <code>deny-commands</code> regexes wali custom class banata hoon. Auditors ke liye <code>read-only</code> use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har user ko class chahiye; class commands tay karti hai.</li>
<li>Predefined: super-user (all), operator (configure nahi), read-only (sirf view), unauthorized.</li>
<li>Custom classes permission flags ko allow-commands aur deny-commands regexes se jodti hain.</li>
<li>Deny hamesha jeetta hai; regex ko <code>^</code> se anchor karo.</li>
<li>Configuration mode ke liye <code>configure</code> permission chahiye.</li>
</ul></div>
`}};export{e as default};