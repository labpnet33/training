var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 120" role="img" aria-label="The five-step troubleshooting loop">
<rect x="5" y="30" width="115" height="55" rx="8" fill="#ddd6fe"/><text x="62" y="54" text-anchor="middle" class="svg-ink" font-size="12">1 Run it</text><text x="62" y="72" text-anchor="middle" class="svg-muted" font-size="11">read the last line</text>
<rect x="132" y="30" width="115" height="55" rx="8" fill="#bae6fd"/><text x="190" y="54" text-anchor="middle" class="svg-ink" font-size="12">2 Name the class</text><text x="190" y="72" text-anchor="middle" class="svg-muted" font-size="11">which stage?</text>
<rect x="259" y="30" width="115" height="55" rx="8" fill="#fde68a"/><text x="317" y="54" text-anchor="middle" class="svg-ink" font-size="12">3 Fix one thing</text><text x="317" y="72" text-anchor="middle" class="svg-muted" font-size="11">with sed</text>
<rect x="386" y="30" width="115" height="55" rx="8" fill="#bbf7d0"/><text x="443" y="54" text-anchor="middle" class="svg-ink" font-size="12">4 Run again</text><text x="443" y="72" text-anchor="middle" class="svg-muted" font-size="11">new error?</text>
<rect x="513" y="30" width="122" height="55" rx="8" fill="#fed7aa"/><text x="574" y="54" text-anchor="middle" class="svg-ink" font-size="12">5 Verify state</text><text x="574" y="72" text-anchor="middle" class="svg-muted" font-size="11">not the exit code</text>
<line x1="120" y1="57" x2="132" y2="57" stroke="#64748b" stroke-width="2"/><line x1="247" y1="57" x2="259" y2="57" stroke="#64748b" stroke-width="2"/><line x1="374" y1="57" x2="386" y2="57" stroke="#64748b" stroke-width="2"/><line x1="501" y1="57" x2="513" y2="57" stroke="#64748b" stroke-width="2"/>
</svg>`,n={id:`troubleshooting`,h:{en:`Troubleshooting workflow: Lab 2, six scripts that fail or seem to succeed`,hi:`Troubleshooting workflow: Lab 2, chhe scripts jo fail hoti hain ya safal dikhti hain`},body:{en:`
<p><b>The idea of this chapter:</b> scrapli errors are precise, so troubleshooting is mostly reading. Lab 2 hands you six scripts <code>t1_login.py</code> to <code>t6_silent.py</code> and a helper <code>check_all.sh</code>. Each has one fault. This chapter shows the loop and the evidence for every fault.</p>

<h3>The loop</h3>
`+e(t,`Run, read the last line, name the exception class, fix one thing, run again, verify the state.`)+`
<ol>
<li><b>Run the script and read the last line</b> of the traceback: the exception class and its message. Ignore the lines above it at first.</li>
<li><b>Name the stage.</b> Where did it stop: before any connection (the platform), during connection (network, login, prompt), or after (your arguments or the output)?</li>
<li><b>Fix one thing</b> with a small <code>sed</code> command.</li>
<li><b>Run again.</b> A new error means progress.</li>
<li><b>Verify the state</b> on the device. An exit code of 0 proves only that no exception was raised.</li>
</ol>

<table class="cmp"><tr><th>Script</th><th>Last line of the error</th><th>Stage</th><th>Fix</th></tr>
<tr><td><code>t1_login.py</code></td><td><code>ScrapliAuthenticationFailed</code></td><td>login</td><td>password: <code>NK@2026</code> is case-sensitive</td></tr>
<tr><td><code>t2_reach.py</code></td><td><code>ScrapliConnectionNotOpened: Timed out opening connection</code></td><td>network</td><td>wrong IP: .12 is nobody, J1 is .11</td></tr>
<tr><td><code>t3_platform.py</code></td><td><code>ScrapliModuleNotFound</code></td><td>before connecting</td><td>netmiko name used: <code>cisco_iosxe</code></td></tr>
<tr><td><code>t4_driver.py</code></td><td><code>ScrapliConnectionNotOpened: Failed to open ... Pattern not detected</code></td><td>prompt</td><td>Junos driver on an IOS XE box</td></tr>
<tr><td><code>t5_type.py</code></td><td><code>ScrapliTypeError</code></td><td>your arguments</td><td>a list, not a string</td></tr>
<tr><td><code>t6_silent.py</code></td><td>no error at all</td><td>output</td><td><code>failed_when_contains</code> and a valid address</td></tr></table>

<h3>Fault 1: the password (t1_login.py)</h3>
<pre class="out">AUTO01$ python3 t1_login.py
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 82, in open
    raise ScrapliAuthenticationFailed(
scrapli.exceptions.ScrapliAuthenticationFailed: failed to authenticate to host 10.99.0.1 with username netops</pre>
<p>The class says it: <code>ScrapliAuthenticationFailed</code>. The message names the host and the user, never the password. The script has <code>"nk@2026"</code> in lower case. Fix: <code>sed -i 's/nk@2026/NK@2026/' t1_login.py</code>. Do not try other passwords in a loop: that is how accounts get locked.</p>
<pre class="out">AUTO01$ python3 t1_login.py
PUN-CORE-R1#
15:01:41.989 UTC Sun Oct 11 2026</pre>

<h3>Fault 2: the wrong address (t2_reach.py)</h3>
<pre class="out">AUTO01$ python3 t2_reach.py
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 86, in open
    raise ScrapliConnectionNotOpened(
scrapli.exceptions.ScrapliConnectionNotOpened: Timed out opening connection to 10.99.0.12:22 (TCP connection to device failed.

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: juniper_junos 10.99.0.12:22
(connection timed out)
)</pre>
<p>Three common causes are listed; number 1, an incorrect IP, fits: the Junos router is 10.99.0.11 and the script says .12. The "Device settings" line shows what the driver tried. Fix: <code>sed -i 's/10.99.0.12/10.99.0.11/' t2_reach.py</code>.</p>

<h3>Fault 3: the platform name (t3_platform.py)</h3>
<pre class="out">AUTO01$ python3 t3_platform.py
scrapli.exceptions.ScrapliModuleNotFound: Module 'scrapli_community.cisco_ios' not found, platform 'cisco_ios' is not a core platform (arista_eos, cisco_iosxe, cisco_iosxr, cisco_nxos, juniper_junos)</pre>
<p>Nothing was sent to the network. The factory knows five names and the message lists them. <code>cisco_ios</code> is a netmiko name; the scrapli name is <code>cisco_iosxe</code>. Fix: <code>sed -i 's/"cisco_ios"/"cisco_iosxe"/' t3_platform.py</code>.</p>

<h3>Fault 4: the wrong driver (t4_driver.py)</h3>
<pre class="out">AUTO01$ python3 t4_driver.py
    self.open()
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 90, in open
    raise ScrapliConnectionNotOpened("Failed to open connection to {}:{}: {}".format(self.host, self.port, err))
scrapli.exceptions.ScrapliConnectionNotOpened: Failed to open connection to 10.99.0.1:22: 

<span class="hl">Pattern not detected: 'Screen width set to' in output.</span>

Things you might try to fix this:
1. Adjust the regex pattern to better identify the terminating string. Note, in
many situations the pattern is automatically based on the network device's prompt.
2. Increase the read_timeout to a larger value.

You can also look at the Netmiko session_log or debug log for more information.</pre>
<p>The Junos driver logged in to an IOS XE router and waited for a Junos answer that never came. The quoted pattern, <code>Screen width set to</code>, is what Junos prints after a screen-width command, so it tells you which vendor the script was written for. Raising a timeout would only make you wait longer. Fix: <code>sed -i 's/"juniper_junos"/"cisco_iosxe"/' t4_driver.py</code>.</p>

<h3>Fault 5: a string instead of a list (t5_type.py)</h3>
<pre class="out">AUTO01$ python3 t5_type.py
scrapli.exceptions.ScrapliTypeError: &#96;send_configs&#96; expects a list of strings, got &lt;class 'str'&gt;</pre>
<p>The exception is raised before anything reaches the switch. <code>send_configs</code> wants a list, even for one line. Fix: <code>sed -i 's/send_configs("ntp server 10.99.0.63")/send_configs(["ntp server 10.99.0.63"])/' t5_type.py</code>. The script cleans up after itself, so the NTP line you see after the fix is removed again.</p>

<h3>Fault 6: success that is not (t6_silent.py)</h3>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: True; Response Elements: 3&gt; failed: False
Building configuration...

Current configuration : 45 bytes
!
interface Loopback10
 description by-scrapli
end</pre>
<p>No error, exit code 0, <code>Success: True</code>, and Loopback10 has a description but <b>no IP address</b>. The router refused the address (10.99.0.0/24 is already on GigabitEthernet0/0), but its answer does not contain any of the default error strings, so scrapli saw nothing. Step one is to make the refusal visible with <code>sed -i 's/send_configs(CONFIG)/send_configs(CONFIG, failed_when_contains=["% "])/' t6_silent.py</code>:</p>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: False; Response Elements: 3&gt; failed: True
interface Loopback10

ip address 10.99.0.1 255.255.255.0
<span class="hl">% 10.99.0.0 overlaps with GigabitEthernet0/0</span>
description by-scrapli

config refused</pre>
<p>Now <code>Success: False</code> and the answer <code>% 10.99.0.0 overlaps with GigabitEthernet0/0</code> is on screen. Step two is the real fix, a valid address: <code>sed -i 's/10.99.0.1 255.255.255.0/10.10.10.10 255.255.255.255/' t6_silent.py</code>.</p>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: True; Response Elements: 3&gt; failed: False
Building configuration...

Current configuration : 85 bytes
!
interface Loopback10
 description by-scrapli
<span class="hl"> ip address 10.10.10.10 255.255.255.255</span>
end</pre>

<h3>The final check</h3>
<pre class="out">AUTO01$ bash check_all.sh
FAIL  t1_login
FAIL  t2_reach
FAIL  t3_platform
FAIL  t4_driver
FAIL  t5_type
ok    t6_silent</pre>
<pre class="out">AUTO01$ bash check_all.sh
ok    t1_login
ok    t2_reach
ok    t3_platform
ok    t4_driver
ok    t5_type
ok    t6_silent</pre>
<p>The first run shows the trap: five FAIL lines and one <code>ok</code> for the script that did nothing. After all fixes six lines say <code>ok</code>, and the state of R1 and E1 has been verified by the scripts' own read-backs.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Error wording follows the lab. The text of the pattern error mentions Netmiko because the lab's transport is built on it, and real scrapli words several of these messages differently (a prompt that never comes is usually a <code>ScrapliTimeout</code> or a <code>ScrapliConnectionNotOpened</code> on real gear). The classes and the way to read them are the same.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing three things at once and not knowing which one worked. Reading the top of the traceback instead of the last line. Treating exit code 0 as proof. Raising timeouts for an error that is not a timeout.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Success: True" is not "the device did it". A refusal worded outside <code>failed_when_contains</code> is invisible; only a read-back shows the truth.</p></div>

<div class="scn"><h4>Fifty routers, one exception class</h4><p>A new colleague's script failed on fifty routers with <code>ScrapliConnectionNotOpened</code> and she started raising timeouts. A senior engineer read the message instead: <i>Pattern not detected</i>, followed by a Junos phrase. The inventory had listed the IOS XE routers as <code>juniper_junos</code>. One column fixed in the CSV, no timeout changed.</p><p><b>Lesson:</b> read the message before you touch a number.</p></div>

<div class="iv"><p class="q">"A scrapli script worked yesterday and fails today. What do you do?"</p><p>I read the last line of the traceback for the exception class. Authentication means credentials, never a retry loop. ConnectionNotOpened with a timeout means network or address. ModuleNotFound or TypeError means a code or inventory change. If there is no error but the result is wrong, I check the Response flags and read the device state back.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Read the last line; the exception class names the stage.</li>
<li>Authentication, address, platform name, driver, argument type: five different classes or messages for five different faults.</li>
<li>The worst fault prints no error: extend <code>failed_when_contains</code> and read state back.</li>
<li>Fix one thing per run; let each new error guide the next step.</li>
<li>Exit code 0 means no exception, nothing more.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> scrapli ke errors precise hote hain, isliye troubleshooting zyadatar padhna hai. Lab 2 aapko chhe scripts <code>t1_login.py</code> se <code>t6_silent.py</code> tak aur ek helper <code>check_all.sh</code> deta hai. Har ek mein ek fault hai. Yeh chapter loop aur har fault ka saboot dikhata hai.</p>

<h3>Loop</h3>
`+e(t,`Chalao, aakhri line padho, exception class ka naam lo, ek cheez theek karo, dobara chalao, state verify karo.`)+`
<ol>
<li><b>Script chalao aur traceback ki aakhri line padho</b>: exception class aur uska message. Pehle uske upar ki lines ignore karo.</li>
<li><b>Stage ka naam lo.</b> Kahan ruka: connection se pehle (platform), connection ke dauran (network, login, prompt), ya baad mein (aapke arguments ya output)?</li>
<li><b>Ek cheez theek karo</b> chhote <code>sed</code> command se.</li>
<li><b>Dobara chalao.</b> Naya error matlab progress.</li>
<li><b>Device par state verify karo.</b> Exit code 0 sirf itna sabit karta hai ki koi exception raise nahi hua.</li>
</ol>

<table class="cmp"><tr><th>Script</th><th>Error ki aakhri line</th><th>Stage</th><th>Fix</th></tr>
<tr><td><code>t1_login.py</code></td><td><code>ScrapliAuthenticationFailed</code></td><td>login</td><td>password: <code>NK@2026</code> case-sensitive hai</td></tr>
<tr><td><code>t2_reach.py</code></td><td><code>ScrapliConnectionNotOpened: Timed out opening connection</code></td><td>network</td><td>galat IP: .12 koi nahi hai, J1 .11 hai</td></tr>
<tr><td><code>t3_platform.py</code></td><td><code>ScrapliModuleNotFound</code></td><td>connect karne se pehle</td><td>netmiko naam use hua: <code>cisco_iosxe</code></td></tr>
<tr><td><code>t4_driver.py</code></td><td><code>ScrapliConnectionNotOpened: Failed to open ... Pattern not detected</code></td><td>prompt</td><td>IOS XE box par Junos driver</td></tr>
<tr><td><code>t5_type.py</code></td><td><code>ScrapliTypeError</code></td><td>aapke arguments</td><td>string nahi, list</td></tr>
<tr><td><code>t6_silent.py</code></td><td>koi error nahi</td><td>output</td><td><code>failed_when_contains</code> aur valid address</td></tr></table>

<h3>Fault 1: password (t1_login.py)</h3>
<pre class="out">AUTO01$ python3 t1_login.py
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 82, in open
    raise ScrapliAuthenticationFailed(
scrapli.exceptions.ScrapliAuthenticationFailed: failed to authenticate to host 10.99.0.1 with username netops</pre>
<p>Class khud batati hai: <code>ScrapliAuthenticationFailed</code>. Message host aur user ka naam deta hai, password ka kabhi nahi. Script mein <code>"nk@2026"</code> chhote letters mein hai. Fix: <code>sed -i 's/nk@2026/NK@2026/' t1_login.py</code>. Loop mein doosre passwords mat aazmao: aise hi accounts lock hote hain.</p>
<pre class="out">AUTO01$ python3 t1_login.py
PUN-CORE-R1#
15:01:41.989 UTC Sun Oct 11 2026</pre>

<h3>Fault 2: galat address (t2_reach.py)</h3>
<pre class="out">AUTO01$ python3 t2_reach.py
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 86, in open
    raise ScrapliConnectionNotOpened(
scrapli.exceptions.ScrapliConnectionNotOpened: Timed out opening connection to 10.99.0.12:22 (TCP connection to device failed.

Common causes of this problem are:
1. Incorrect hostname or IP address.
2. Wrong TCP port.
3. Intermediate firewall blocking access.

Device settings: juniper_junos 10.99.0.12:22
(connection timed out)
)</pre>
<p>Teen aam karan list hain; number 1, galat IP, sahi baithta hai: Junos router 10.99.0.11 hai aur script .12 kehti hai. "Device settings" line dikhati hai driver ne kya try kiya. Fix: <code>sed -i 's/10.99.0.12/10.99.0.11/' t2_reach.py</code>.</p>

<h3>Fault 3: platform naam (t3_platform.py)</h3>
<pre class="out">AUTO01$ python3 t3_platform.py
scrapli.exceptions.ScrapliModuleNotFound: Module 'scrapli_community.cisco_ios' not found, platform 'cisco_ios' is not a core platform (arista_eos, cisco_iosxe, cisco_iosxr, cisco_nxos, juniper_junos)</pre>
<p>Network par kuch nahi bheja gaya. Factory paanch naam jaanti hai aur message unhe list karta hai. <code>cisco_ios</code> netmiko ka naam hai; scrapli ka naam <code>cisco_iosxe</code> hai. Fix: <code>sed -i 's/"cisco_ios"/"cisco_iosxe"/' t3_platform.py</code>.</p>

<h3>Fault 4: galat driver (t4_driver.py)</h3>
<pre class="out">AUTO01$ python3 t4_driver.py
    self.open()
  File "/usr/lib/python3.11/scrapli/driver/base.py", line 90, in open
    raise ScrapliConnectionNotOpened("Failed to open connection to {}:{}: {}".format(self.host, self.port, err))
scrapli.exceptions.ScrapliConnectionNotOpened: Failed to open connection to 10.99.0.1:22: 

<span class="hl">Pattern not detected: 'Screen width set to' in output.</span>

Things you might try to fix this:
1. Adjust the regex pattern to better identify the terminating string. Note, in
many situations the pattern is automatically based on the network device's prompt.
2. Increase the read_timeout to a larger value.

You can also look at the Netmiko session_log or debug log for more information.</pre>
<p>Junos driver ne IOS XE router mein login kiya aur Junos ke jawab ka intezaar kiya jo kabhi nahi aaya. Quoted pattern, <code>Screen width set to</code>, woh hai jo Junos screen-width command ke baad print karta hai, isliye woh batata hai script kis vendor ke liye likhi gayi thi. Timeout badhane se sirf zyada intezaar hota. Fix: <code>sed -i 's/"juniper_junos"/"cisco_iosxe"/' t4_driver.py</code>.</p>

<h3>Fault 5: list ki jagah string (t5_type.py)</h3>
<pre class="out">AUTO01$ python3 t5_type.py
scrapli.exceptions.ScrapliTypeError: &#96;send_configs&#96; expects a list of strings, got &lt;class 'str'&gt;</pre>
<p>Exception switch tak kuch pahunchne se pehle raise hota hai. <code>send_configs</code> ko list chahiye, ek line ke liye bhi. Fix: <code>sed -i 's/send_configs("ntp server 10.99.0.63")/send_configs(["ntp server 10.99.0.63"])/' t5_type.py</code>. Script apne baad safai karti hai, isliye fix ke baad jo NTP line dikhti hai woh phir hata di jaati hai.</p>

<h3>Fault 6: success jo success nahi (t6_silent.py)</h3>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: True; Response Elements: 3&gt; failed: False
Building configuration...

Current configuration : 45 bytes
!
interface Loopback10
 description by-scrapli
end</pre>
<p>Koi error nahi, exit code 0, <code>Success: True</code>, aur Loopback10 par description hai par <b>IP address nahi</b>. Router ne address refuse kiya (10.99.0.0/24 pehle se GigabitEthernet0/0 par hai), par uske jawab mein default error strings mein se koi nahi, isliye scrapli ko kuch dikha nahi. Pehla step refusal ko dikhana hai: <code>sed -i 's/send_configs(CONFIG)/send_configs(CONFIG, failed_when_contains=["% "])/' t6_silent.py</code>:</p>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: False; Response Elements: 3&gt; failed: True
interface Loopback10

ip address 10.99.0.1 255.255.255.0
<span class="hl">% 10.99.0.0 overlaps with GigabitEthernet0/0</span>
description by-scrapli

config refused</pre>
<p>Ab <code>Success: False</code> hai aur jawab <code>% 10.99.0.0 overlaps with GigabitEthernet0/0</code> screen par hai. Doosra step asli fix hai, valid address: <code>sed -i 's/10.99.0.1 255.255.255.0/10.10.10.10 255.255.255.255/' t6_silent.py</code>.</p>
<pre class="out">AUTO01$ python3 t6_silent.py
MultiResponse &lt;Success: True; Response Elements: 3&gt; failed: False
Building configuration...

Current configuration : 85 bytes
!
interface Loopback10
 description by-scrapli
<span class="hl"> ip address 10.10.10.10 255.255.255.255</span>
end</pre>

<h3>Aakhri check</h3>
<pre class="out">AUTO01$ bash check_all.sh
FAIL  t1_login
FAIL  t2_reach
FAIL  t3_platform
FAIL  t4_driver
FAIL  t5_type
ok    t6_silent</pre>
<pre class="out">AUTO01$ bash check_all.sh
ok    t1_login
ok    t2_reach
ok    t3_platform
ok    t4_driver
ok    t5_type
ok    t6_silent</pre>
<p>Pehli run trap dikhati hai: paanch FAIL lines aur ek <code>ok</code> us script ke liye jisne kuch kiya hi nahi. Saare fixes ke baad chhe lines <code>ok</code> kehti hain, aur R1 aur E1 ki state scripts ke apne read-backs ne verify ki.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Error ke shabd lab ke hain. Pattern error ke text mein Netmiko ka zikr hai kyunki lab ka transport usi par bana hai, aur real scrapli inme se kai messages alag shabdon mein kehta hai (jo prompt kabhi nahi aata, real gear par aksar woh <code>ScrapliTimeout</code> ya <code>ScrapliConnectionNotOpened</code> hota hai). Classes aur unhe padhne ka tareeka same hain.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> Teen cheezein ek saath theek karna aur na jaanna ki kaunsi chali. Traceback ki aakhri line ki jagah upar ka hissa padhna. Exit code 0 ko saboot maanna. Aise error ke liye timeouts badhana jo timeout hai hi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Success: True" ka matlab "device ne kar diya" nahi hai. <code>failed_when_contains</code> ke bahar ke shabdon wala refusal dikhta hi nahi; sirf read-back sach dikhata hai.</p></div>

<div class="scn"><h4>Pachaas routers, ek exception class</h4><p>Ek naye colleague ki script pachaas routers par <code>ScrapliConnectionNotOpened</code> ke saath fail hui aur woh timeouts badhane lagi. Ek senior engineer ne message padha: <i>Pattern not detected</i>, uske baad ek Junos phrase. Inventory ne IOS XE routers ko <code>juniper_junos</code> likha tha. CSV mein ek column theek hua, koi timeout nahi badla.</p><p><b>Lesson:</b> koi number chhune se pehle message padho.</p></div>

<div class="iv"><p class="q">"Ek scrapli script kal chali thi aur aaj fail hoti hai. Kya karte ho?"</p><p>Main traceback ki aakhri line se exception class padhta hoon. Authentication matlab credentials, retry loop kabhi nahi. Timeout ke saath ConnectionNotOpened matlab network ya address. ModuleNotFound ya TypeError matlab code ya inventory change. Agar error nahi hai par result galat hai, to Response flags dekhta hoon aur device ki state wapas padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aakhri line padho; exception class stage ka naam batati hai.</li>
<li>Authentication, address, platform naam, driver, argument type: paanch faults ke liye paanch alag classes ya messages.</li>
<li>Sabse bura fault koi error print nahi karta: <code>failed_when_contains</code> badhao aur state wapas padho.</li>
<li>Har run mein ek cheez theek karo; har naya error agla step batata hai.</li>
<li>Exit code 0 ka matlab bas itna hai ki exception nahi aaya.</li>
</ul></div>
`}};export{n as default};