var e=e=>`<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="Recap">
<rect x="10" y="25" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="52" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="11">ss -tuln, who needs what</text>
<rect x="180" y="25" width="140" height="60" rx="8" fill="#fed7aa"/><text x="250" y="52" text-anchor="middle" class="svg-ink" font-size="13">Rules</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="11">default deny, narrow allow</text>
<rect x="350" y="25" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="420" y="52" text-anchor="middle" class="svg-ink" font-size="13">Enable</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="11">SSH first, then test</text>
<rect x="520" y="25" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="52" text-anchor="middle" class="svg-ink" font-size="13">Watch</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="11">ufw.log</text>
<line x1="150" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code"><span class="c"># look first</span>
sudo ufw status verbose              <span class="c"># active? defaults? rules?</span>
sudo ufw status numbered             <span class="c"># rules with positions</span>
sudo ufw show added                  <span class="c"># rules you added, even if inactive</span>
ss -tuln                             <span class="c"># which ports are listening</span>
<span class="c"># build</span>
sudo ufw default deny incoming
sudo ufw allow from 10.99.0.0/24 to any port 22 proto tcp
sudo ufw allow from 10.99.0.0/24 to any port 514 proto udp
sudo ufw allow 80/tcp
sudo ufw insert 1 deny from 198.51.100.0/24 to any port 80 proto tcp
sudo ufw delete 1                    <span class="c"># by number: re-check numbers first</span>
sudo ufw delete allow 80/udp         <span class="c"># by words</span>
sudo ufw enable                      <span class="c"># SSH rule first</span>
sudo ufw disable                     <span class="c"># emergency rollback</span>
<span class="c"># prove and watch</span>
nc -zv 10.99.0.20 22                 <span class="c"># from a client: succeeded, timed out, refused</span>
sudo iptables -L -n                  <span class="c"># what the kernel holds</span>
sudo grep 'SRC=10.20.0.10' /var/log/ufw.log</pre>`,n={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You can now plan, build, enable, test, troubleshoot and audit a host firewall. This chapter is your revision sheet.</p>
`+e(`The whole module: plan, rules, enable, watch.`)+`
<h3>Can-do checklist</h3>
<ul>
<li>Explain why a host firewall complements a network ACL (defence in depth) and name the layers: netfilter, iptables or nftables, ufw.</li>
<li>List what a server listens on with <code>ss -tuln</code> and plan the rules from it.</li>
<li>Set <code>ufw default deny incoming</code> and explain why default deny fails safe.</li>
<li>Write allow rules with source network, port and protocol, and read the reply.</li>
<li>Explain first match wins; use <code>status numbered</code>, <code>insert</code> and <code>delete</code>; spot a deny above an allow.</li>
<li>Choose between deny, reject and limit.</li>
<li>Enable safely: SSH first, test with <code>nc -zv</code> from allowed and disallowed clients, read timed out versus refused.</li>
<li>Read a <code>[UFW BLOCK]</code> line field by field and filter the log with grep.</li>
<li>Verify with <code>iptables -L -n</code> and know that nftables and application profiles exist.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Default policy</dt><dd>What happens to a packet that matches no rule. Use deny for incoming.</dd>
<dt>First match</dt><dd>The first rule that matches decides; later rules are ignored for that packet.</dd>
<dt>deny / reject / limit</dt><dd>Drop silently / drop and answer with an error / allow but slow repeated connections.</dd>
<dt>CIDR</dt><dd>Network notation such as 10.99.0.0/24.</dd>
<dt>DPT</dt><dd>Destination port in a firewall log line.</dd>
<dt>netfilter</dt><dd>The packet filter inside the Linux kernel.</dd>
<dt>Least privilege</dt><dd>Allow only what is needed, only to those who need it.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Which rule wins?</td><td>The first match, not the most specific.</td></tr>
<tr><td>Client sees "timed out"</td><td>Packets dropped silently: firewall or path.</td></tr>
<tr><td>Client sees "refused"</td><td>Host reachable; nothing listens or a reject rule answered.</td></tr>
<tr><td>Which rule before enable?</td><td>SSH, from the management network.</td></tr>
<tr><td>Where are blocks logged?</td><td>/var/log/ufw.log with [UFW BLOCK].</td></tr>
<tr><td>Syslog port and protocol</td><td>UDP 514, so allow 514/udp, not tcp.</td></tr></table>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Self-test. A new web server has a stray allow for 23/tcp. Write the plan: delete the stray rule, default deny incoming, allow SSH from 10.99.0.0/24, allow 80/tcp, enable, test from inside and outside, check the log. Then name the failure a deny above an allow causes (a timeout for the allowed network) and the fix (delete or move the deny).</p></div>

<div class="warn"><p><b>Common mistakes to avoid.</b> No SSH rule before enable, wrong protocol, a broad allow above a specific deny, trusting a service-name shortcut without re-reading the list, and disabling the firewall as a "fix".</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often show a rule list and ask whether a given source can connect. Walk the list from the top, stop at the first match, and use the default policy only if nothing matched.</p></div>

<div class="scn"><h4>The audit that passed</h4><p>A quarterly review compared the rule files in version control to <code>ufw status</code> and <code>iptables -L -n</code> on every server. One server had an extra allow for a retired application. It was deleted in five minutes and the change was recorded. An attacker scanning that range later found nothing open except what the plan said.</p><p><b>Lesson:</b> a firewall is not finished when it is enabled; it is finished when it is audited.</p></div>

<div class="iv"><p class="q">"Walk me through hardening a new management server."</p><p>List listening ports with ss, plan who needs each, set default deny incoming, add narrow allow rules from the management network, enable with SSH rule present, test from inside and outside using nc, review the log, record the rules as code, and re-audit on a schedule.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default deny plus narrow allows is the foundation.</li>
<li>Order is policy: first match wins.</li>
<li>Test from the client side and read the log from the server side.</li>
<li>Fix causes, prove both sides, and keep the rules as code.</li>
</ul></div>
`,hi:`
<p>Ab aap host firewall ko plan, build, enable, test, troubleshoot aur audit kar sakte ho. Yeh chapter aapki revision sheet hai.</p>
`+e(`Poora module: plan, rules, enable, watch.`)+`
<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki host firewall network ACL ka poorak kyun hai (defence in depth) aur layers batao: netfilter, iptables ya nftables, ufw.</li>
<li><code>ss -tuln</code> se server kis par sunta hai list karo aur usse rules plan karo.</li>
<li><code>ufw default deny incoming</code> set karo aur samjhao ki default deny safe fail kyun hota hai.</li>
<li>Source network, port aur protocol ke saath allow rules likho, aur reply padho.</li>
<li>Samjhao pehla match jeetta hai; <code>status numbered</code>, <code>insert</code> aur <code>delete</code> use karo; allow ke upar deny pehchano.</li>
<li>Deny, reject aur limit mein chuno.</li>
<li>Safely enable karo: pehle SSH, allowed aur disallowed clients se <code>nc -zv</code> test, timed out aur refused ka farak padho.</li>
<li><code>[UFW BLOCK]</code> line field by field padho aur grep se log filter karo.</li>
<li><code>iptables -L -n</code> se verify karo aur jaano ki nftables aur application profiles hote hain.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Default policy</dt><dd>Jo packet kisi rule se match nahi karta uske saath kya hota hai. Incoming ke liye deny.</dd>
<dt>First match</dt><dd>Pehla matching rule faisla karta hai; baad ke rules us packet ke liye ignore.</dd>
<dt>deny / reject / limit</dt><dd>Chupchaap drop / drop aur error se jawab / allow par baar-baar connections dheeme.</dd>
<dt>CIDR</dt><dd>10.99.0.0/24 jaisa network notation.</dd>
<dt>DPT</dt><dd>Firewall log line mein destination port.</dd>
<dt>netfilter</dt><dd>Linux kernel ke andar packet filter.</dd>
<dt>Least privilege</dt><dd>Sirf zaroori cheez, sirf unhe jinhe zaroorat hai, allow karo.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Kaunsa rule jeetta hai?</td><td>Pehla match, sabse specific nahi.</td></tr>
<tr><td>Client ko "timed out" dikhta hai</td><td>Packets chupchaap drop: firewall ya path.</td></tr>
<tr><td>Client ko "refused" dikhta hai</td><td>Host reachable; kuch sun nahi raha ya reject rule ne jawab diya.</td></tr>
<tr><td>Enable se pehle kaunsa rule?</td><td>SSH, management network se.</td></tr>
<tr><td>Blocks kahan log hote hain?</td><td>/var/log/ufw.log mein [UFW BLOCK] ke saath.</td></tr>
<tr><td>Syslog port aur protocol</td><td>UDP 514, isliye allow 514/udp, tcp nahi.</td></tr></table>

<h3>Command cheat sheet</h3>
`+t+`

<div class="eg"><p><b>Worked example.</b> Self-test. Naye web server par 23/tcp ka stray allow hai. Plan likho: stray rule delete, default deny incoming, 10.99.0.0/24 se SSH allow, 80/tcp allow, enable, andar aur bahar se test, log check. Phir naam lo woh failure jo allow ke upar deny paida karta hai (allowed network ke liye timeout) aur fix (deny delete ya move).</p></div>

<div class="warn"><p><b>Bachne wali galtiyan.</b> Enable se pehle SSH rule nahi, galat protocol, specific deny ke upar broad allow, service-naam shortcut ko bina list dobara padhe bharosa karna, aur firewall disable karke use "fix" kehna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar rule list dikhate hain aur poochhte hain ki diya gaya source connect kar sakta hai ya nahi. List upar se chalo, pehle match par ruko, aur default policy tabhi lo jab kuch match na ho.</p></div>

<div class="scn"><h4>Woh audit jo pass hua</h4><p>Ek quarterly review ne har server par version control ki rule files ko <code>ufw status</code> aur <code>iptables -L -n</code> se compare kiya. Ek server par ek retired application ka extra allow tha. Woh paanch minute mein delete hua aur badlav record hua. Baad mein us range ko scan karne wale attacker ko plan ke kehne ke alawa kuch khula nahi mila.</p><p><b>Lesson:</b> firewall enable hone par poora nahi hota; audit hone par poora hota hai.</p></div>

<div class="iv"><p class="q">"Naye management server ko harden karne ka tareeka batao."</p><p>ss se listening ports list karo, har ek ke liye kisko chahiye plan karo, default deny incoming set karo, management network se narrow allow rules jodo, SSH rule maujood rakhkar enable karo, nc se andar aur bahar se test karo, log review karo, rules ko code ki tarah record karo, aur schedule par dobara audit karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Default deny plus narrow allows neev hai.</li>
<li>Order policy hai: pehla match jeetta hai.</li>
<li>Client side se test karo aur server side se log padho.</li>
<li>Karan fix karo, dono taraf sabit karo, aur rules ko code ki tarah rakho.</li>
</ul></div>
`}};export{n as default};