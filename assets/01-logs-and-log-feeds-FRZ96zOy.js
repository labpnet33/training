var e={id:`logs-feeds`,h:{en:`Logs and log feeds`,hi:`Logs aur log feeds`},body:{en:`
<h3>What you will learn</h3>
<p>This module is about running the service day to day: reading logs, sending them to the security team's SIEM, using the policy tester, troubleshooting end to end, and changing things safely. <b>Prerequisites:</b> forwarding, policy order and identity modules. In the vendor's own wording the three services of this family are called ZIA, ZPA and ZDX; here we say internet access policy, private access and digital experience.</p>

<h3>Why logs exist</h3>
<p>Think of a shop's CCTV and billing register. When a customer says "I was charged wrongly", you look at the record. A security service is the same: every request that passes through the cloud is written down with who, what, where, and what the decision was. Without logs you can only guess; with logs you can prove.</p>

<h3>Web logs and firewall logs</h3>
<ul>
<li><b>Web log</b>: one line per web request: time, user, location, host, category, action (allow, block, caution), the rule that decided, and a type.</li>
<li><b>Firewall log</b>: one line per non-web connection (for example ssh or rdp to an internet address): user or location, protocol, port, action, rule.</li>
</ul>
<p>The simulator lets you search logs with tokens: <code>user</code>, <code>host</code>, <code>action</code>, <code>rule</code>, <code>type</code> and <code>loc</code>. The lab check "a request was logged" uses exactly those tokens.</p>

<h3>The most important fact: some traffic has no log</h3>
<p>Only traffic that reaches the cloud is logged. A request that went <b>direct</b> (a bypass, a PAC DIRECT, a down tunnel that fails open) never touched the cloud, so there is no log line, no policy, no inspection. When someone says "I cannot find the request in the logs", the first answer to consider is "it never arrived".</p>

<h3>Log feeds to a SIEM</h3>
<p>A <b>SIEM</b> is the security team's central search and alert system. Reading logs in the portal is fine for one ticket; a SIEM keeps months, correlates with other systems and raises alerts. A <b>log feed</b> streams the logs from the cloud to the SIEM. A feed needs four things to be right:</p>
<table class="cmp"><tr><th>Part</th><th>Meaning</th><th>If wrong</th></tr>
<tr><td>Destination host</td><td>Name of the SIEM receiver</td><td>Logs go to a machine that is not listening</td></tr>
<tr><td>Port</td><td>Where the SIEM listens (the lab SIEM uses a syslog-style port 514; real values come from your SIEM documentation)</td><td>Connection refused, nothing arrives</td></tr>
<tr><td>Format</td><td>How each line is written (the lab SIEM expects <code>json</code>)</td><td>Lines arrive but the SIEM cannot parse them</td></tr>
<tr><td>Enabled and log service up</td><td>The feed switch and the log service itself</td><td>No delivery at all</td></tr>
</table>
<p>In the portal these are <code>nss.feeds</code> entries (name, type web or firewall, enabled, destination, format, filter) and <code>nss.vm.up</code> for the log service. A feed <b>delivers only when it is enabled, the log service is up, the destination host and port equal the SIEM, and the format equals the SIEM format</b>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Log feed path">
<rect x="10" y="50" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="75" y="80" text-anchor="middle" class="svg-ink" font-size="13">Cloud policy</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">writes logs</text>
<rect x="190" y="50" width="130" height="70" rx="10" fill="#bae6fd"/><text x="255" y="80" text-anchor="middle" class="svg-ink" font-size="13">Log service</text><text x="255" y="100" text-anchor="middle" class="svg-muted" font-size="12">must be up</text>
<rect x="370" y="50" width="100" height="70" rx="10" fill="#fde68a"/><text x="420" y="80" text-anchor="middle" class="svg-ink" font-size="13">Feed</text><text x="420" y="100" text-anchor="middle" class="svg-muted" font-size="12">dest, port, format</text>
<rect x="510" y="50" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text><text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">siem.corp.example</text>
<line x1="140" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="85" x2="370" y2="85" stroke="#64748b" stroke-width="2"/><line x1="470" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">any one wrong part and the SIEM sees nothing useful</text>
</svg><p class="cap">Four conditions along one line.</p></div>

<pre class="out">Log feeds
Name         Type      Enabled  Destination                Format   Status
web-siem     web       yes      siem.corp.example:514      json     <span class="hl">delivering</span>
fw-siem      firewall  yes      siem.corp.example:6514     syslog   <span class="hl">FAILING (port, format)</span>
Log service: up     SIEM: siem.corp.example:514 json</pre>

<div class="eg"><p><b>Worked example, lab zs-ops-1.</b> The fw-siem feed shows failing. Compare it with the SIEM: the port and the format differ. Correct both, activate changes, and check that the status turns delivering. One wrong value is enough to fail, so fix every difference, not only the first.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> A feed adds an outbound connection from the log service to the SIEM and changes nothing about user traffic or decisions. A wrong destination or port means connection attempts that fail; a wrong format means connections that succeed but data nobody can parse.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the port but leaving the format wrong. (2) Forgetting the log service itself. (3) Searching for a direct-path request in logs that cannot contain it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Feed enabled but SIEM empty": check destination, port, format and log service, in that order. Exact port numbers belong to your SIEM documentation.</p></div>

<div class="scn"><h4>The silent SIEM</h4><p>The security team noticed that alerts on blocked downloads had stopped. The feed list showed two feeds failing after a SIEM upgrade changed its listening port and accepted format. The engineer updated both, saw delivering, and asked the SIEM team to confirm a test event.</p><p><b>Lesson:</b> confirm at both ends.</p></div>

<div class="iv"><p class="q">"Logs stopped arriving at the SIEM. What do you check?"</p><p>Feed enabled, log service up, destination host and port against the SIEM, and the format. Then send a test request and confirm it at the SIEM, not only in the portal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Web logs and firewall logs record who, what, rule and action.</li>
<li>Direct traffic never reaches the cloud, so it is never logged.</li>
<li>A feed needs: enabled, log service up, correct destination, port and format.</li>
<li>Search logs by user, host, action, rule, type and location.</li>
<li>Verify delivery at the SIEM.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Yeh module service ko roz chalane ke baare mein hai: logs padhna, unhe security team ke SIEM ko bhejna, policy tester use karna, end to end troubleshooting, aur changes safely karna. <b>Prerequisites:</b> forwarding, policy order aur identity modules. Vendor ke apne wording mein is family ki teen services ZIA, ZPA aur ZDX kehlati hain; yahan hum internet access policy, private access aur digital experience bolte hain.</p>

<h3>Logs kyun hote hain</h3>
<p>Shop ke CCTV aur billing register socho. Customer kahe "mujhse galat charge hua", to aap record dekhte ho. Security service bhi waisi hi hai: cloud se guzarne wali har request likhi jaati hai, kaun, kya, kahan, aur decision kya tha. Logs ke bina aap sirf guess karte ho; logs ke saath prove kar sakte ho.</p>

<h3>Web logs aur firewall logs</h3>
<ul>
<li><b>Web log</b>: har web request ki ek line: time, user, location, host, category, action (allow, block, caution), decide karne wala rule, aur type.</li>
<li><b>Firewall log</b>: har non-web connection ki ek line (jaise internet address par ssh ya rdp): user ya location, protocol, port, action, rule.</li>
</ul>
<p>Simulator tokens se logs search karne deta hai: <code>user</code>, <code>host</code>, <code>action</code>, <code>rule</code>, <code>type</code> aur <code>loc</code>. Lab check "request logged thi" bilkul inhi tokens ko use karta hai.</p>

<h3>Sabse zaroori fact: kuch traffic ka log nahi hota</h3>
<p>Sirf jo traffic cloud tak pahunchta hai woh log hota hai. Jo request <b>direct</b> gayi (bypass, PAC DIRECT, down tunnel jo fail open hua) woh cloud ko chhuti hi nahi, to na log line, na policy, na inspection. Koi kahe "logs mein request nahi mil rahi", to pehla jawab sochne layak hai "woh pahunchi hi nahi".</p>

<h3>SIEM ko log feeds</h3>
<p><b>SIEM</b> security team ka central search aur alert system hai. Ek ticket ke liye portal mein logs padhna theek hai; SIEM mahino rakhta hai, dusre systems ke saath correlate karta hai aur alerts raise karta hai. <b>Log feed</b> cloud se SIEM tak logs stream karta hai. Feed ke liye chaar cheezein sahi honi chahiye:</p>
<table class="cmp"><tr><th>Part</th><th>Matlab</th><th>Galat ho to</th></tr>
<tr><td>Destination host</td><td>SIEM receiver ka naam</td><td>Logs aisi machine ko jaate hain jo sun nahi rahi</td></tr>
<tr><td>Port</td><td>Jahan SIEM sunta hai (lab SIEM syslog-style port 514 use karta hai; asli values aapke SIEM documentation se aati hain)</td><td>Connection refused, kuch nahi pahunchta</td></tr>
<tr><td>Format</td><td>Har line kaise likhi jaati hai (lab SIEM <code>json</code> expect karta hai)</td><td>Lines pahunchti hain lekin SIEM parse nahi kar pata</td></tr>
<tr><td>Enabled aur log service up</td><td>Feed ka switch aur log service khud</td><td>Delivery bilkul nahi</td></tr>
</table>
<p>Portal mein yeh <code>nss.feeds</code> entries (name, type web ya firewall, enabled, destination, format, filter) aur log service ke liye <code>nss.vm.up</code> hain. Feed <b>tabhi deliver karta hai jab woh enabled ho, log service up ho, destination host aur port SIEM ke barabar hon, aur format SIEM format ke barabar ho</b>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Log feed path">
<rect x="10" y="50" width="130" height="70" rx="10" fill="#ddd6fe"/><text x="75" y="80" text-anchor="middle" class="svg-ink" font-size="13">Cloud policy</text><text x="75" y="100" text-anchor="middle" class="svg-muted" font-size="12">logs likhti hai</text>
<rect x="190" y="50" width="130" height="70" rx="10" fill="#bae6fd"/><text x="255" y="80" text-anchor="middle" class="svg-ink" font-size="13">Log service</text><text x="255" y="100" text-anchor="middle" class="svg-muted" font-size="12">up honi chahiye</text>
<rect x="370" y="50" width="100" height="70" rx="10" fill="#fde68a"/><text x="420" y="80" text-anchor="middle" class="svg-ink" font-size="13">Feed</text><text x="420" y="100" text-anchor="middle" class="svg-muted" font-size="12">dest, port, format</text>
<rect x="510" y="50" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="570" y="80" text-anchor="middle" class="svg-ink" font-size="13">SIEM</text><text x="570" y="100" text-anchor="middle" class="svg-muted" font-size="12">siem.corp.example</text>
<line x1="140" y1="85" x2="190" y2="85" stroke="#64748b" stroke-width="2"/><line x1="320" y1="85" x2="370" y2="85" stroke="#64748b" stroke-width="2"/><line x1="470" y1="85" x2="510" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-muted" font-size="12">koi ek part galat to SIEM ko kaam ka kuch nahi dikhta</text>
</svg><p class="cap">Ek line par chaar conditions.</p></div>

<pre class="out">Log feeds
Name         Type      Enabled  Destination                Format   Status
web-siem     web       yes      siem.corp.example:514      json     <span class="hl">delivering</span>
fw-siem      firewall  yes      siem.corp.example:6514     syslog   <span class="hl">FAILING (port, format)</span>
Log service: up     SIEM: siem.corp.example:514 json</pre>

<div class="eg"><p><b>Worked example, lab zs-ops-1.</b> fw-siem feed failing dikhata hai. SIEM se compare karo: port aur format alag hain. Dono sahi karo, activate changes karo, aur check karo ki status delivering ho jaaye. Ek galat value fail karne ke liye kaafi hai, to har difference fix karo, sirf pehla nahi.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Feed log service se SIEM tak ek outbound connection jodta hai aur user traffic ya decisions mein kuch nahi badalta. Galat destination ya port ka matlab connection attempts jo fail hote hain; galat format ka matlab connections jo succeed hote hain lekin data jo koi parse nahi kar sakta.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Port fix karna lekin format galat chhod dena. (2) Log service khud ko bhool jaana. (3) Direct-path request ko aise logs mein search karna jinme woh ho hi nahi sakti.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Feed enabled hai lekin SIEM khaali": destination, port, format aur log service check karo, isi order mein. Exact port numbers aapke SIEM documentation ke hain.</p></div>

<div class="scn"><h4>Chup SIEM</h4><p>Security team ne dekha ki blocked downloads ke alerts band ho gaye. Feed list mein do feeds failing the, SIEM upgrade ke baad jisne listening port aur accepted format badal diya tha. Engineer ne dono update kiye, delivering dekha, aur SIEM team se test event confirm karne ko kaha.</p><p><b>Seekh:</b> dono ends par confirm karo.</p></div>

<div class="iv"><p class="q">"Logs SIEM tak aana band ho gaye. Kya check karoge?"</p><p>Feed enabled, log service up, destination host aur port SIEM ke against, aur format. Phir test request bhejo aur SIEM par confirm karo, sirf portal mein nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Web logs aur firewall logs who, what, rule aur action record karte hain.</li>
<li>Direct traffic cloud tak nahi pahunchta, to kabhi log nahi hota.</li>
<li>Feed ko chahiye: enabled, log service up, sahi destination, port aur format.</li>
<li>Logs ko user, host, action, rule, type aur location se search karo.</li>
<li>Delivery SIEM par verify karo.</li>
</ul></div>
`}};export{e as default};