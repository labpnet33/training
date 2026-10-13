var e={id:`summary`,h:{en:`Summary and exam checklist: services on one page`,hi:`Summary aur exam checklist: services ek page par`},body:{en:`
<p>You began with a server that had no web server and ended by repairing two silent failures. This chapter puts services on one page: what you can do, the words to know, the facts interviews repeat, and a cheat sheet for your first weeks.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what a service is and what systemd and <code>systemctl</code> do.</li>
<li>Install a package with <code>sudo apt update</code> and <code>sudo apt install</code>, and explain "Unable to locate package".</li>
<li>Read <code>systemctl status</code>: dot, Loaded (enabled), Active, recent log lines.</li>
<li>Use <code>is-active</code>, <code>is-enabled</code>, <code>--failed</code> and <code>list-units --type=service</code>.</li>
<li>Run start, stop, restart, reload, enable, disable, and say which affect now and which affect boot.</li>
<li>Find the listening port with <code>sudo ss -tlnp</code> and test the page with <code>curl</code> from the server and a client.</li>
<li>Read the journal with <code>journalctl -u</code>, <code>-n</code>, <code>-p err</code>, <code>--since</code>.</li>
<li>Read a cron line (five fields plus user and command) and check that cron itself is running.</li>
<li>Follow the five-step workflow: find, status, journal, fix and test, verify from a client.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service / daemon</dt><dd>A background program that waits for work.</dd>
<dt>systemd</dt><dd>The program that starts and watches services on modern Ubuntu.</dd>
<dt>Unit</dt><dd>What systemd manages; a service is a unit ending in .service.</dd>
<dt>Enabled</dt><dd>Set to start at boot.</dd>
<dt>Active</dt><dd>Running now.</dd>
<dt>Journal</dt><dd>The log systemd keeps; read with journalctl.</dd>
<dt>Web root</dt><dd>The folder nginx serves pages from: /var/www/html.</dd>
<dt>cron</dt><dd>The scheduler service that runs jobs at set times.</dd>
</dl>

<h3>Facts interviews and exams repeat</h3>
<table class="cmp"><thead><tr><th>Question</th><th>Answer</th></tr></thead><tbody>
<tr><td>Running now?</td><td>systemctl is-active name</td></tr>
<tr><td>Starts at boot?</td><td>systemctl is-enabled name</td></tr>
<tr><td>Start now and at boot?</td><td>sudo systemctl enable --now name</td></tr>
<tr><td>Apply config without outage?</td><td>reload (if supported)</td></tr>
<tr><td>What is on port 80?</td><td>sudo ss -tlnp</td></tr>
<tr><td>Only errors from the log?</td><td>journalctl -p err</td></tr>
<tr><td>Cron field order?</td><td>minute hour day-of-month month day-of-week</td></tr>
<tr><td>Refused vs timed out?</td><td>Service down vs network or firewall</td></tr>
</tbody></table>

<h3>Cheat sheet</h3>
<pre class="code">sudo apt update &amp;&amp; sudo apt install nginx   <span class="c"># install</span>
systemctl status nginx                     <span class="c"># state + last log lines</span>
systemctl --failed                         <span class="c"># what is broken?</span>
sudo systemctl enable --now nginx          <span class="c"># start now and at boot</span>
sudo ss -tlnp                              <span class="c"># who listens where</span>
curl localhost                             <span class="c"># test on the server</span>
journalctl -u nginx -n 20                  <span class="c"># last 20 log lines</span>
journalctl -p err --since today            <span class="c"># today's errors</span></pre>

<div class="warn"><p><b>Defensive reminder.</b> Change services only on systems you are authorised to manage, announce outages, and keep a way back in (a second session or console) before restarting remote access services such as SSH.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active is not enabled; start is not enable; reload is not restart. Three pairs, three classic wrong answers.</p></div>

<div class="scn"><h4>Handover note</h4><p>You hand NMS02 to the next shift. Your note lists: nginx active and enabled, port 80 verified from WS01, ssh and cron active, failed list empty, and the two root causes of last night's ticket. The next engineer starts from facts, not guesses.</p></div>

<div class="iv"><p class="q">"Give me the three commands you run first on a server that feels wrong."</p><p><code>systemctl --failed</code> to see broken services, <code>systemctl status</code> on the suspect for state and recent logs, and <code>journalctl -p err</code> for the error lines. Then I fix what the log names and verify from a client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>systemd runs services; systemctl controls them.</li>
<li>Check active and enabled, and the port, and the log.</li>
<li>Test from a client; finish with an empty failed list.</li>
<li>cron is a service too.</li>
</ul></div>
`,hi:`
<p>Aapne aise server se shuruaat ki jisme web server nahi tha aur do chupchap failures repair karke ant kiya. Yeh chapter services ko ek page par rakhta hai: aap kya kar sakte ho, jaanne wale shabd, woh facts jo interviews doharate hain, aur pehle hafton ke liye cheat sheet.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao service kya hai aur systemd tatha <code>systemctl</code> kya karte hain.</li>
<li><code>sudo apt update</code> aur <code>sudo apt install</code> se package install karo, aur "Unable to locate package" samjhao.</li>
<li><code>systemctl status</code> padho: dot, Loaded (enabled), Active, recent log lines.</li>
<li><code>is-active</code>, <code>is-enabled</code>, <code>--failed</code> aur <code>list-units --type=service</code> use karo.</li>
<li>start, stop, restart, reload, enable, disable chalao, aur batao kaun abhi ko aur kaun boot ko affect karta hai.</li>
<li><code>sudo ss -tlnp</code> se listening port dhundo aur server tatha client se <code>curl</code> se page test karo.</li>
<li><code>journalctl -u</code>, <code>-n</code>, <code>-p err</code>, <code>--since</code> se journal padho.</li>
<li>Cron line padho (paanch fields plus user aur command) aur check karo ki cron khud chal raha hai.</li>
<li>Paanch-step workflow follow karo: find, status, journal, fix aur test, client se verify.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Service / daemon</dt><dd>Background program jo kaam ka intezaar karta hai.</dd>
<dt>systemd</dt><dd>Modern Ubuntu par services start aur watch karne wala program.</dd>
<dt>Unit</dt><dd>Jo systemd manage karta hai; service .service par khatam hone wali unit hai.</dd>
<dt>Enabled</dt><dd>Boot par start hone ke liye set.</dd>
<dt>Active</dt><dd>Abhi chal rahi hai.</dd>
<dt>Journal</dt><dd>systemd ka rakha hua log; journalctl se padhte hain.</dd>
<dt>Web root</dt><dd>Woh folder jahan se nginx pages serve karta hai: /var/www/html.</dd>
<dt>cron</dt><dd>Scheduler service jo tay samay par jobs chalati hai.</dd>
</dl>

<h3>Interviews aur exams ke repeat facts</h3>
<table class="cmp"><thead><tr><th>Sawal</th><th>Jawab</th></tr></thead><tbody>
<tr><td>Abhi chal rahi?</td><td>systemctl is-active name</td></tr>
<tr><td>Boot par start?</td><td>systemctl is-enabled name</td></tr>
<tr><td>Abhi aur boot dono par start?</td><td>sudo systemctl enable --now name</td></tr>
<tr><td>Bina outage ke config apply?</td><td>reload (agar supported)</td></tr>
<tr><td>Port 80 par kya hai?</td><td>sudo ss -tlnp</td></tr>
<tr><td>Log se sirf errors?</td><td>journalctl -p err</td></tr>
<tr><td>Cron field order?</td><td>minute hour day-of-month month day-of-week</td></tr>
<tr><td>Refused vs timed out?</td><td>Service down vs network ya firewall</td></tr>
</tbody></table>

<h3>Cheat sheet</h3>
<pre class="code">sudo apt update &amp;&amp; sudo apt install nginx   <span class="c"># install</span>
systemctl status nginx                     <span class="c"># state + last log lines</span>
systemctl --failed                         <span class="c"># kya toota hai?</span>
sudo systemctl enable --now nginx          <span class="c"># abhi aur boot par start</span>
sudo ss -tlnp                              <span class="c"># kaun kahan sunta hai</span>
curl localhost                             <span class="c"># server par test</span>
journalctl -u nginx -n 20                  <span class="c"># aakhri 20 log lines</span>
journalctl -p err --since today            <span class="c"># aaj ke errors</span></pre>

<div class="warn"><p><b>Defensive reminder.</b> Services sirf unhi systems par badlo jinhe manage karne ki ijazat hai, outages announce karo, aur SSH jaisi remote access services restart karne se pehle wapas aane ka raasta (doosri session ya console) rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active enabled nahi hai; start enable nahi hai; reload restart nahi hai. Teen jodiyan, teen classic galat jawab.</p></div>

<div class="scn"><h4>Handover note</h4><p>Aap NMS02 agli shift ko dete ho. Aapke note mein: nginx active aur enabled, port 80 WS01 se verify, ssh aur cron active, failed list khaali, aur kal raat ke ticket ke do root causes. Agla engineer andaze se nahi, facts se shuru karta hai.</p></div>

<div class="iv"><p class="q">"Jis server par kuch galat lage wahan pehle kaunse teen commands chalate ho?"</p><p><code>systemctl --failed</code> toote services dekhne ke liye, shak wali service par <code>systemctl status</code> state aur recent logs ke liye, aur error lines ke liye <code>journalctl -p err</code>. Phir jo log batata hai use fix karta hoon aur client se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>systemd services chalata hai; systemctl control karta hai.</li>
<li>Active aur enabled, port, aur log check karo.</li>
<li>Client se test karo; khaali failed list par khatam karo.</li>
<li>cron bhi ek service hai.</li>
</ul></div>
`}};export{e as default};