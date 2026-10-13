var e={id:`troubleshooting`,h:{en:`Troubleshooting a multivendor script: read the error, find the layer`,hi:`Multivendor script ki troubleshooting: error padho, layer dhoondho`},body:{en:`
<p><b>The idea of this chapter:</b> a netmiko failure is never "the script is broken". It is one of five layers: the <b>name</b> you gave (device_type), the <b>credentials</b>, the <b>reachability</b>, the <b>prompt pattern</b> the script waits for, or the <b>configuration model</b> of the vendor. The exception class tells you the layer before you read a single line of the traceback. Lab 2 hands you four such collectors, each of which worked on Cisco and fails elsewhere.</p>

<h3>Analogy: the courier who cannot deliver</h3>
<p>A courier fails for different reasons: wrong building name (device_type), the guard refuses him (authentication), the road is closed (timeout), he waits at the wrong door for a signature (expect_string), or he leaves the parcel on the doorstep unsigned (uncommitted config). Each reason leaves a different note. Read the note first.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Exception class tells which layer failed">
<rect x="8" y="30" width="118" height="84" rx="8" fill="#fde68a"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="12">ValueError</text><text x="67" y="78" text-anchor="middle" class="svg-muted" font-size="10">name wrong</text><text x="67" y="94" text-anchor="middle" class="svg-muted" font-size="10">before network</text>
<rect x="136" y="30" width="118" height="84" rx="8" fill="#fecaca"/><text x="195" y="52" text-anchor="middle" class="svg-ink" font-size="11">NetmikoAuth</text><text x="195" y="66" text-anchor="middle" class="svg-ink" font-size="11">Exception</text><text x="195" y="88" text-anchor="middle" class="svg-muted" font-size="10">credentials</text>
<rect x="264" y="30" width="118" height="84" rx="8" fill="#bae6fd"/><text x="323" y="52" text-anchor="middle" class="svg-ink" font-size="11">NetmikoTimeout</text><text x="323" y="66" text-anchor="middle" class="svg-ink" font-size="11">Exception</text><text x="323" y="88" text-anchor="middle" class="svg-muted" font-size="10">cannot connect</text>
<rect x="392" y="30" width="118" height="84" rx="8" fill="#ddd6fe"/><text x="451" y="58" text-anchor="middle" class="svg-ink" font-size="12">ReadTimeout</text><text x="451" y="78" text-anchor="middle" class="svg-muted" font-size="10">pattern never</text><text x="451" y="94" text-anchor="middle" class="svg-muted" font-size="10">appeared</text>
<rect x="520" y="30" width="112" height="84" rx="8" fill="#bbf7d0"/><text x="576" y="58" text-anchor="middle" class="svg-ink" font-size="12">no exception</text><text x="576" y="78" text-anchor="middle" class="svg-muted" font-size="10">wrong result</text><text x="576" y="94" text-anchor="middle" class="svg-muted" font-size="10">silent failure</text>
</svg><p class="cap">Five outcomes, five layers. The silent one is the dangerous one.</p></div>

<table class="cmp"><tr><th>What you see</th><th>Layer</th><th>First move</th></tr>
<tr><td><code>ValueError</code> listing platforms</td><td>device_type name</td><td>Pick a name from the list</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>credentials</td><td>Check this device's own user and password; never retry</td></tr>
<tr><td><code>NetmikoTimeoutException</code></td><td>reach, SSH, vty limit</td><td>ping, port 22, free vty lines; retry with back-off</td></tr>
<tr><td><code>ReadTimeout</code> with <code>Pattern not detected</code></td><td>prompt or expect_string</td><td>Is the device_type right for this vendor?</td></tr>
<tr><td><code>TextFSMError</code> or a raw string</td><td>parsing</td><td>No template for this command and platform</td></tr>
<tr><td><code>ConfigInvalidException</code></td><td>config error_pattern</td><td>Read the error line; call <code>exit_config_mode()</code></td></tr>
<tr><td>Empty or unchanged result</td><td>config model</td><td>Was it committed? Did the device return error text?</td></tr></table>
<div class="warn"><p><b>Do not catch the wrong class.</b> <code>ReadTimeout</code> is not a <code>NetmikoTimeoutException</code>. A retry loop written for the second will let the first crash the whole run.</p></div>

<h3>Fault 1: a Cisco router typed as Junos</h3>
<pre class="out">AUTO01$ python3 arp_r1.py
Traceback (most recent call last):
  File "arp_r1.py", line 10, in &lt;module&gt;
    with ConnectHandler(**dev) as conn:
netmiko.exceptions.ReadTimeout:

<span class="hl">Pattern not detected: 'Screen width set to' in output.</span></pre>
<p>The script died on the connect line, before any show command. The text in quotes is the key: <code>Screen width set to</code> is what <i>Junos</i> prints after <code>set cli screen-width 511</code>. Netmiko sent Junos preparation to an IOS box and waited for an answer that IOS never gives. Read the quoted pattern, ask which platform prints it, and compare with the box. The fix is the name: <code>sed -i 's/"juniper_junos"/"cisco_ios"/' arp_r1.py</code>, then the ARP table appears. If the pattern mentions something you do not recognise, SSH to the device by hand and look at the first prompt.</p>

<h3>Fault 2: the Junos change that vanished</h3>
<pre class="out">AUTO01$ python3 ntp_j1.py
ntp on J1:
<span class="hl"></span>
</pre>
<p>No error, no value: the second connection shows an empty NTP section. This is the silent failure of chapter 6. <code>send_config_set</code> on Junos leaves config mode at the end by default and Junos discards the uncommitted candidate. The fix keeps the session in config mode and commits:</p>
<pre class="code">with ConnectHandler(**dev) as conn:
    conn.send_config_set(["set system ntp server 10.99.0.1"], <span class="hl">exit_config_mode=False</span>)
    <span class="hl">conn.commit(comment="ntp via netmiko")</span></pre>
<pre class="out">ntp on J1:
server 10.99.0.1;</pre>
<p>The proof is a <i>second</i> session reading the state, which is what the script already does. A script that only trusts its own first session cannot catch this.</p>

<h3>Fault 3: a pattern copied from Cisco</h3>
<pre class="out">AUTO01$ python3 uptime_j1.py
netmiko.exceptions.ReadTimeout:
<span class="hl">Pattern not detected: '#' in output.</span></pre>
<p>Someone passed <code>expect_string="#"</code> because IOS prompts end with <code>#</code>. A Junos operational prompt ends with <code>&gt;</code> (<code>netops@J1&gt;</code>), so the pattern never appears and the call waits out its <code>read_timeout</code>. Remove the argument and let netmiko use the prompt it learned: <code>sed -i 's/, expect_string="#", read_timeout=30//' uptime_j1.py</code>. Use <code>expect_string</code> only for dialogs where the prompt really changes, and then match the real text, as in chapter 4.</p>

<h3>Fault 4: one device, its own password</h3>
<pre class="out">AUTO01$ python3 vlans_n1.py
netmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

<span class="hl">Device settings: cisco_nxos 10.99.0.31:22</span></pre>
<p>The last line says what netmiko tried: platform, address, port. The address and platform are right, so the password is wrong for <i>this</i> device. N1 has its own password, <code>NKlab@123</code>. Fix the dev dictionary, not the SSH client. Never retry this error: repeated bad logins lock the account and alert the security team. The fix, <code>sed -i 's/NK@2026/NKlab@123/'</code>, lets the VLAN rows print (<code>1 default active</code> and the reserved ones).</p>

<h3>An unknown box: SSHDetect</h3>
<pre class="out">AUTO01$ python3 mystery.py
best match: arista_eos
all matches: {'arista_eos': 99}
E1#</pre>
<p>When an inventory lists no vendor, <code>SSHDetect</code> probes the device and scores each candidate. Use it once to <i>fill the inventory</i>, then store the answer; do not run it before every collection. Treat a low score (the lab shows 90 for some platforms and 99 for others) as a suggestion to confirm.</p>

<h3>Exit code zero is not proof</h3>
<pre class="out">AUTO01$ bash check_all.sh
ok    arp_r1
ok    ntp_j1
ok    uptime_j1
ok    vlans_n1</pre>
<p><code>check_all.sh</code> only tests that each script <i>exits</i> cleanly. Before the fix, <code>ntp_j1.py</code> also exited 0 while changing nothing. A green run means "no exception", so add an assertion on the result (the NTP server is present, the VLAN list is not empty) when the result matters.</p>

<div class="warn"><p><b>Common mistakes.</b> Debugging the script instead of reading the quoted pattern. Raising <code>read_timeout</code> to "fix" a wrong device_type. Retrying authentication failures. Trusting an exit code. Pasting a Cisco recipe onto Junos, EOS or NX-OS without checking its prompt and its config model.</p></div>
<div class="exam"><p><b>Exam trap.</b> The same symptom, "it hangs then times out", has two classes: <code>NetmikoTimeoutException</code> (could not connect) and <code>ReadTimeout</code> (connected, waiting for a pattern). Choose the fix by the class.</p></div>

<div class="scn"><h4>The loop that never ended</h4><p>A nightly script stopped producing output after the firewall team added a new Palo Alto. The new inventory row said <code>cisco_ios</code> because that was the default column. Every attempt waited out the timeout, and the retry loop multiplied it by three.</p><p><b>Lesson:</b> the quoted pattern in the ReadTimeout named a PAN-OS message; one look at it would have found the wrong device_type in a minute.</p></div>

<div class="iv"><p class="q">"A netmiko script times out on one new device only. How do you find the cause?"</p><p>First the class: <code>NetmikoTimeoutException</code> means reachability, SSH or the vty limit; <code>ReadTimeout</code> means it connected and waited for a pattern. For ReadTimeout I read the quoted pattern, check the device_type for that vendor, and look at the first prompt by hand. I fix the cause, not the timeout value.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The exception class names the layer; the quoted text names the detail.</li>
<li>A pattern from another vendor in a ReadTimeout means the wrong device_type or expect_string.</li>
<li>Authentication errors are never retried; timeouts may be, with back-off.</li>
<li>Silent failures (uncommitted Junos, returned error text) need a read-back check.</li>
<li>Exit code 0 means no exception, not success.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> netmiko failure kabhi "script toot gayi" nahi hoti. Woh paanch layers mein se ek hoti hai: aapka diya <b>naam</b> (device_type), <b>credentials</b>, <b>reachability</b>, woh <b>prompt pattern</b> jiska script intezaar karti hai, ya vendor ka <b>configuration model</b>. Exception class traceback ki ek line padhne se pehle hi layer bata deti hai. Lab 2 aapko chaar aise collectors deta hai jo Cisco par chale aur baaki jagah fail hue.</p>

<h3>Analogy: courier jo deliver nahi kar paata</h3>
<p>Courier alag-alag wajah se fail hota hai: building ka naam galat (device_type), guard rok deta hai (authentication), sadak band (timeout), woh signature ke liye galat darwaze par khada hai (expect_string), ya parcel bina sign ke chaukhat par chhod diya (uncommitted config). Har wajah ka alag note hota hai. Pehle note padho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Exception class tells which layer failed">
<rect x="8" y="30" width="118" height="84" rx="8" fill="#fde68a"/><text x="67" y="58" text-anchor="middle" class="svg-ink" font-size="12">ValueError</text><text x="67" y="78" text-anchor="middle" class="svg-muted" font-size="10">naam galat</text><text x="67" y="94" text-anchor="middle" class="svg-muted" font-size="10">network se pehle</text>
<rect x="136" y="30" width="118" height="84" rx="8" fill="#fecaca"/><text x="195" y="52" text-anchor="middle" class="svg-ink" font-size="11">NetmikoAuth</text><text x="195" y="66" text-anchor="middle" class="svg-ink" font-size="11">Exception</text><text x="195" y="88" text-anchor="middle" class="svg-muted" font-size="10">credentials</text>
<rect x="264" y="30" width="118" height="84" rx="8" fill="#bae6fd"/><text x="323" y="52" text-anchor="middle" class="svg-ink" font-size="11">NetmikoTimeout</text><text x="323" y="66" text-anchor="middle" class="svg-ink" font-size="11">Exception</text><text x="323" y="88" text-anchor="middle" class="svg-muted" font-size="10">connect nahi hua</text>
<rect x="392" y="30" width="118" height="84" rx="8" fill="#ddd6fe"/><text x="451" y="58" text-anchor="middle" class="svg-ink" font-size="12">ReadTimeout</text><text x="451" y="78" text-anchor="middle" class="svg-muted" font-size="10">pattern kabhi</text><text x="451" y="94" text-anchor="middle" class="svg-muted" font-size="10">nahi aaya</text>
<rect x="520" y="30" width="112" height="84" rx="8" fill="#bbf7d0"/><text x="576" y="58" text-anchor="middle" class="svg-ink" font-size="12">koi exception nahi</text><text x="576" y="78" text-anchor="middle" class="svg-muted" font-size="10">galat result</text><text x="576" y="94" text-anchor="middle" class="svg-muted" font-size="10">silent failure</text>
</svg><p class="cap">Paanch nateeje, paanch layers. Silent wala sabse khatarnak hai.</p></div>

<table class="cmp"><tr><th>Kya dikhta hai</th><th>Layer</th><th>Pehla kadam</th></tr>
<tr><td><code>ValueError</code> platforms ki list ke saath</td><td>device_type naam</td><td>List se naam chuno</td></tr>
<tr><td><code>NetmikoAuthenticationException</code></td><td>credentials</td><td>Is device ka apna user aur password dekho; retry kabhi nahi</td></tr>
<tr><td><code>NetmikoTimeoutException</code></td><td>reach, SSH, vty limit</td><td>ping, port 22, khaali vty lines; back-off ke saath retry</td></tr>
<tr><td><code>ReadTimeout</code> aur <code>Pattern not detected</code></td><td>prompt ya expect_string</td><td>Kya device_type is vendor ke liye sahi hai?</td></tr>
<tr><td><code>TextFSMError</code> ya raw string</td><td>parsing</td><td>Is command aur platform ka template nahi hai</td></tr>
<tr><td><code>ConfigInvalidException</code></td><td>config error_pattern</td><td>Error line padho; <code>exit_config_mode()</code> bulao</td></tr>
<tr><td>Khaali ya na badla result</td><td>config model</td><td>Commit hua? Device ne error text lautaya?</td></tr></table>
<div class="warn"><p><b>Galat class mat pakdo.</b> <code>ReadTimeout</code>, <code>NetmikoTimeoutException</code> nahi hai. Doosri ke liye likha retry loop pehli ko poora run crash karne dega.</p></div>

<h3>Fault 1: Cisco router jise Junos likha gaya</h3>
<pre class="out">AUTO01$ python3 arp_r1.py
Traceback (most recent call last):
  File "arp_r1.py", line 10, in &lt;module&gt;
    with ConnectHandler(**dev) as conn:
netmiko.exceptions.ReadTimeout:

<span class="hl">Pattern not detected: 'Screen width set to' in output.</span></pre>
<p>Script connect wali line par hi mar gayi, kisi show command se pehle. Quotes ke andar ka text kunji hai: <code>Screen width set to</code> woh hai jo <i>Junos</i> <code>set cli screen-width 511</code> ke baad print karta hai. Netmiko ne Junos ki preparation IOS box ko bheji aur aise jawab ka intezaar kiya jo IOS deta hi nahi. Quoted pattern padho, poochho kaunsa platform use print karta hai, aur box se milao. Fix naam hai: <code>sed -i 's/"juniper_junos"/"cisco_ios"/' arp_r1.py</code>, phir ARP table aa jaati hai. Pattern mein kuch anjaan ho to device par haath se SSH karke pehla prompt dekho.</p>

<h3>Fault 2: Junos ka badlaav jo gayab ho gaya</h3>
<pre class="out">AUTO01$ python3 ntp_j1.py
ntp on J1:
<span class="hl"></span>
</pre>
<p>Na error, na value: doosre connection mein NTP section khaali hai. Yeh chapter 6 ki silent failure hai. Junos par <code>send_config_set</code> default mein ant mein config mode chhodta hai aur Junos uncommitted candidate phenk deta hai. Fix session ko config mode mein rakhta hai aur commit karta hai:</p>
<pre class="code">with ConnectHandler(**dev) as conn:
    conn.send_config_set(["set system ntp server 10.99.0.1"], <span class="hl">exit_config_mode=False</span>)
    <span class="hl">conn.commit(comment="ntp via netmiko")</span></pre>
<pre class="out">ntp on J1:
server 10.99.0.1;</pre>
<p>Saboot <i>doosra</i> session hai jo state padhta hai, jo script pehle se karti hai. Jo script sirf apne pehle session par bharosa kare woh yeh nahi pakad sakti.</p>

<h3>Fault 3: Cisco se copy kiya pattern</h3>
<pre class="out">AUTO01$ python3 uptime_j1.py
netmiko.exceptions.ReadTimeout:
<span class="hl">Pattern not detected: '#' in output.</span></pre>
<p>Kisi ne <code>expect_string="#"</code> diya kyunki IOS ke prompt <code>#</code> par khatam hote hain. Junos operational prompt <code>&gt;</code> par khatam hota hai (<code>netops@J1&gt;</code>), isliye pattern kabhi nahi aata aur call apna <code>read_timeout</code> poora intezaar karti hai. Argument hata do aur netmiko ko wahi prompt use karne do jo usne seekha: <code>sed -i 's/, expect_string="#", read_timeout=30//' uptime_j1.py</code>. <code>expect_string</code> sirf un dialogs ke liye use karo jahan prompt sach mein badalta hai, aur tab asli text match karo, jaise chapter 4 mein.</p>

<h3>Fault 4: ek device, apna password</h3>
<pre class="out">AUTO01$ python3 vlans_n1.py
netmiko.exceptions.NetmikoAuthenticationException: Authentication to device failed.

Common causes of this problem are:
1. Invalid username and password
2. Incorrect SSH-key file
3. Connecting to the wrong device

<span class="hl">Device settings: cisco_nxos 10.99.0.31:22</span></pre>
<p>Aakhri line batati hai netmiko ne kya try kiya: platform, address, port. Address aur platform sahi hain, to password <i>is</i> device ke liye galat hai. N1 ka apna password <code>NKlab@123</code> hai. dev dictionary theek karo, SSH client nahi. Yeh error kabhi retry mat karo: baar-baar galat login account lock karte hain aur security team ko alert bhejte hain. Fix, <code>sed -i 's/NK@2026/NKlab@123/'</code>, VLAN rows print karwa deta hai (<code>1 default active</code> aur reserved wale).</p>

<h3>Anjaan box: SSHDetect</h3>
<pre class="out">AUTO01$ python3 mystery.py
best match: arista_eos
all matches: {'arista_eos': 99}
E1#</pre>
<p>Jab inventory mein vendor likha hi na ho, <code>SSHDetect</code> device ko probe karta hai aur har candidate ko score deta hai. Ise ek baar use karo <i>inventory bharne</i> ke liye, jawab store karo; har collection se pehle mat chalao. Kam score (lab mein kuch platforms ke liye 90 aur kuch ke liye 99) ko confirm karne ka ishara samjho.</p>

<h3>Exit code zero saboot nahi hai</h3>
<pre class="out">AUTO01$ bash check_all.sh
ok    arp_r1
ok    ntp_j1
ok    uptime_j1
ok    vlans_n1</pre>
<p><code>check_all.sh</code> sirf yeh dekhta hai ki har script saaf <i>exit</i> hui. Fix se pehle <code>ntp_j1.py</code> bhi 0 se exit hui aur kuch nahi badla. Green run ka matlab "koi exception nahi", isliye jab result mayne rakhta ho to result par assertion jodo (NTP server maujood hai, VLAN list khaali nahi).</p>

<div class="warn"><p><b>Common mistakes.</b> Script debug karna jabki quoted pattern padhna tha. Galat device_type ko "theek" karne ke liye <code>read_timeout</code> badhana. Authentication failures retry karna. Exit code par bharosa. Cisco ki recipe Junos, EOS ya NX-OS par prompt aur config model dekhe bina paste karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek hi lakshan, "hang hoke timeout", ki do classes hain: <code>NetmikoTimeoutException</code> (connect nahi hua) aur <code>ReadTimeout</code> (connect hua, pattern ka intezaar). Fix class dekhkar chuno.</p></div>

<div class="scn"><h4>Woh loop jo khatam nahi hua</h4><p>Firewall team ne naya Palo Alto joda aur ek nightly script ka output band ho gaya. Naye inventory row mein <code>cisco_ios</code> likha tha kyunki default column wahi tha. Har koshish ne timeout poora intezaar kiya, aur retry loop ne use teen se guna kar diya.</p><p><b>Lesson:</b> ReadTimeout ke quoted pattern mein PAN-OS ka message tha; ek nazar mein ek minute mein galat device_type mil jaata.</p></div>

<div class="iv"><p class="q">"Netmiko script sirf ek naye device par timeout hoti hai. Wajah kaise dhoondhte ho?"</p><p>Pehle class: <code>NetmikoTimeoutException</code> matlab reachability, SSH ya vty limit; <code>ReadTimeout</code> matlab connect hua aur pattern ka intezaar kiya. ReadTimeout mein quoted pattern padhta hoon, us vendor ka device_type check karta hoon, aur pehla prompt haath se dekhta hoon. Wajah theek karta hoon, timeout value nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Exception class layer batati hai; quoted text tafseel batata hai.</li>
<li>ReadTimeout mein doosre vendor ka pattern matlab galat device_type ya expect_string.</li>
<li>Authentication errors kabhi retry nahi; timeouts back-off ke saath ho sakte hain.</li>
<li>Silent failures (uncommitted Junos, lautaya error text) ko read-back check chahiye.</li>
<li>Exit code 0 ka matlab koi exception nahi, success nahi.</li>
</ul></div>
`}};export{e as default};