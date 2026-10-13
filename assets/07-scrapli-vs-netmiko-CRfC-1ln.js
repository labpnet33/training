var e=(e,t)=>`<div class="dia">`+e+`<p class="cap">`+t+`</p></div>`,t=`<svg viewBox="0 0 640 230" role="img" aria-label="Choosing between netmiko and scrapli">
<rect x="215" y="8" width="210" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">New automation task</text>
<rect x="20" y="86" width="190" height="52" rx="8" fill="#bae6fd"/><text x="115" y="108" text-anchor="middle" class="svg-ink" font-size="12">platform outside the</text><text x="115" y="124" text-anchor="middle" class="svg-ink" font-size="12">scrapli core list?</text>
<rect x="225" y="86" width="190" height="52" rx="8" fill="#bae6fd"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">large fleet, async,</text><text x="320" y="124" text-anchor="middle" class="svg-ink" font-size="12">typed errors wanted?</text>
<rect x="430" y="86" width="190" height="52" rx="8" fill="#bae6fd"/><text x="525" y="108" text-anchor="middle" class="svg-ink" font-size="12">quick one-off script,</text><text x="525" y="124" text-anchor="middle" class="svg-ink" font-size="12">team knows netmiko?</text>
<rect x="20" y="176" width="190" height="40" rx="8" fill="#fde68a"/><text x="115" y="201" text-anchor="middle" class="svg-ink" font-size="13">netmiko (or community)</text>
<rect x="225" y="176" width="190" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="201" text-anchor="middle" class="svg-ink" font-size="13">scrapli</text>
<rect x="430" y="176" width="190" height="40" rx="8" fill="#fde68a"/><text x="525" y="201" text-anchor="middle" class="svg-ink" font-size="13">netmiko</text>
<line x1="280" y1="48" x2="115" y2="86" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="48" x2="320" y2="86" stroke="#64748b" stroke-width="1.5"/><line x1="360" y1="48" x2="525" y2="86" stroke="#64748b" stroke-width="1.5"/>
<line x1="115" y1="138" x2="115" y2="176" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="138" x2="320" y2="176" stroke="#64748b" stroke-width="1.5"/><line x1="525" y1="138" x2="525" y2="176" stroke="#64748b" stroke-width="1.5"/>
</svg>`,n={id:`scrapli-vs-netmiko`,h:{en:`scrapli or netmiko? The comparison and the decision`,hi:`scrapli ya netmiko? Comparison aur decision`},body:{en:`
<p><b>The idea of this chapter:</b> you now know both libraries on three vendors. This chapter puts them side by side on the same router, gives you a porting table, and ends with a rule for choosing. The goal is not a winner; it is the right tool for each job.</p>

<h3>Lab 1, task 7: compare.py</h3>
<p>The script runs the same good command and the same mistyped command on R1 through both libraries. It reads the password from .env, as every script in this module does.</p>
<pre class="code">import os

from dotenv import load_dotenv
from netmiko import ConnectHandler
from scrapli import Scrapli

load_dotenv(".env")
user, password = os.environ["NET_USER"], os.environ["NET_PASS"]

with ConnectHandler(device_type="cisco_ios", host="10.99.0.1", username=user,
                    password=password, secret=password) as nm:
    nm_good = nm.send_command("show ip interface brief")
    nm_bad = nm.send_command("show ip interfaces brief")

with Scrapli(platform="cisco_iosxe", host="10.99.0.1", auth_username=user,
             auth_password=password, auth_secondary=password, auth_strict_key=False) as sc:
    sc_good = sc.send_command("show ip interface brief")
    sc_bad = sc.send_command("show ip interfaces brief")

print(f"same text       : {nm_good == sc_good.result}")
print(f"netmiko returns : {type(nm_good).__name__}")
print(f"scrapli returns : {type(sc_good).__name__}")
print(f"bad command     : netmiko gives {type(nm_bad).__name__}, scrapli says failed={sc_bad.failed}")
print("platform names  : netmiko cisco_ios, scrapli cisco_iosxe")</pre>
<pre class="out">AUTO01$ python3 compare.py
same text       : True
netmiko returns : str
scrapli returns : Response
<span class="hl">bad command     : netmiko gives str, scrapli says failed=True</span>
platform names  : netmiko cisco_ios, scrapli cisco_iosxe</pre>
<p>Three facts in four lines. The text is identical, so scrapli and netmiko really talk to the same device the same way. netmiko hands you a plain <code>str</code>, scrapli a <code>Response</code>. And for the mistyped command netmiko gives you a <code>str</code> that happens to contain an error, while scrapli says <code>failed=True</code>. The highlighted line answers the lab question: scrapli puts the flag on it.</p>

<h3>Porting table</h3>
<table class="cmp"><tr><th>Task</th><th>netmiko</th><th>scrapli</th></tr>
<tr><td>Open</td><td><code>ConnectHandler(**dev)</code></td><td><code>Scrapli(**dev)</code></td></tr>
<tr><td>Platform</td><td><code>device_type="cisco_ios"</code></td><td><code>platform="cisco_iosxe"</code></td></tr>
<tr><td>Login keys</td><td><code>username</code>, <code>password</code>, <code>secret</code></td><td><code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code></td></tr>
<tr><td>Show command</td><td><code>conn.send_command(c)</code> is text</td><td><code>conn.send_command(c).result</code></td></tr>
<tr><td>Structured</td><td><code>send_command(c, use_textfsm=True)</code></td><td><code>send_command(c).textfsm_parse_output()</code></td></tr>
<tr><td>Configuration</td><td><code>send_config_set(lines)</code></td><td><code>send_configs(lines)</code></td></tr>
<tr><td>Commit (Junos)</td><td><code>conn.commit()</code></td><td>the line <code>"commit"</code> at the end of your list</td></tr>
<tr><td>Close</td><td><code>disconnect()</code></td><td><code>close()</code></td></tr>
<tr><td>Bad login</td><td><code>NetmikoAuthenticationException</code></td><td><code>ScrapliAuthenticationFailed</code></td></tr>
<tr><td>Unreachable</td><td><code>NetmikoTimeoutException</code></td><td><code>ScrapliConnectionNotOpened</code></td></tr></table>
<p>The Lab 1 files show the port in practice: <code>common.py</code> here is the adv-nkmiko <code>common.py</code> with new keys, <code>collect()</code> instead of an explicit loop, and the exceptions renamed. The logic of <code>interfaces.py</code>, <code>backup.py</code> and the NTP push did not change; only the way errors are noticed did.</p>

<h3>When to choose which</h3>
`+e(t,`Start from the platform, then the size of the job, then the habits of the team.`)+`
<table class="cmp"><tr><th>Choose scrapli when</th><th>Choose netmiko when</th></tr>
<tr><td>you want a Response with a <code>failed</code> flag and timing on every command</td><td>you need a platform outside the core five and do not want an extra package</td></tr>
<tr><td>you want typed exceptions and strict argument checking</td><td>you write a quick one-off script and your team already knows it</td></tr>
<tr><td>you run a big fleet and want a faster transport (<code>system</code> or <code>ssh2</code>) or the async variant</td><td>you need its many built-in helpers such as <code>save_config()</code> or <code>commit()</code> as methods</td></tr>
<tr><td>you plan to move to Nornir with <code>nornir_scrapli</code></td><td>you plan to move to Nornir with <code>nornir_netmiko</code>, or your tools (NAPALM, for IOS) already use it</td></tr></table>
<p>Both open one SSH session per device, and both belong in the thread-per-device pattern of <code>py-concurrency</code>. Nornir (module <code>adv-nornir</code>) wraps either of them, so what you learn here carries over.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The speed advantage of scrapli comes from its transports: the system OpenSSH client and the C-based <code>ssh2</code> library are much faster than pure-Python SSH, and the <code>asyncssh</code> transport lets one process drive many devices without threads. The lab uses its own transport and has no real network delays, so it cannot show this. Measure on your own network before you decide. Async scrapli (<code>AsyncScrapli</code>) is not available in the lab. The companion packages <code>scrapli_netconf</code>, <code>scrapli_cfg</code> and <code>scrapli_community</code> exist on real gear; none of them is in the lab.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Porting only the names and keeping the netmiko habit of treating the result as text. Expecting a method such as <code>commit()</code> or <code>save_config()</code> on scrapli drivers: send the lines yourself. Choosing scrapli for a vendor outside the core list and then spending a day on community platforms. Choosing on a speed claim you never measured.</p></div>
<div class="exam"><p><b>Exam trap.</b> Same device, two libraries, two names for IOS XE: netmiko <code>cisco_ios</code>, scrapli <code>cisco_iosxe</code>. Using one library's name in the other is the commonest first error.</p></div>

<div class="scn"><h4>Half a day to port, a day saved every month</h4><p>A team ported their backup collector from netmiko to scrapli. The port took half a day, mostly renaming arguments. In the first week the new <code>raise_for_status()</code> calls caught a typo in the Junos command table that the old job had stored as "backups" for three months. They kept both libraries: netmiko for a handful of legacy platforms, scrapli for the core fleet.</p><p><b>Lesson:</b> choose per job; a team can run two libraries side by side.</p></div>

<div class="iv"><p class="q">"Would you rewrite a working netmiko script in scrapli?"</p><p>Not just for fashion. I would if I needed the Response object, typed errors or a faster transport, or if the script moves into Nornir with the scrapli plugin. The port is mechanical: rename the arguments, use <code>.result</code>, turn <code>use_textfsm</code> into <code>textfsm_parse_output()</code>, and add the failure checks that scrapli makes possible.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Same device, same text; the difference is the return type and the failure handling.</li>
<li>Names differ: <code>cisco_ios</code> versus <code>cisco_iosxe</code>, <code>username</code> versus <code>auth_username</code>.</li>
<li>scrapli sends commit and save as plain lines; netmiko has methods.</li>
<li>Choose by platform coverage, job size and team habits; the speed claim needs your own measurement.</li>
<li>Nornir can use either library, so the skills carry over.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> ab aap dono libraries teen vendors par jaante ho. Yeh chapter unhe ek hi router par side by side rakhta hai, porting table deta hai, aur chunne ke niyam par khatam hota hai. Maksad winner nahi hai; har kaam ke liye sahi tool hai.</p>

<h3>Lab 1, task 7: compare.py</h3>
<p>Script R1 par wahi theek command aur wahi galat likhi command dono libraries se chalati hai. Password .env se padhti hai, jaise is module ki har script.</p>
<pre class="code">import os

from dotenv import load_dotenv
from netmiko import ConnectHandler
from scrapli import Scrapli

load_dotenv(".env")
user, password = os.environ["NET_USER"], os.environ["NET_PASS"]

with ConnectHandler(device_type="cisco_ios", host="10.99.0.1", username=user,
                    password=password, secret=password) as nm:
    nm_good = nm.send_command("show ip interface brief")
    nm_bad = nm.send_command("show ip interfaces brief")

with Scrapli(platform="cisco_iosxe", host="10.99.0.1", auth_username=user,
             auth_password=password, auth_secondary=password, auth_strict_key=False) as sc:
    sc_good = sc.send_command("show ip interface brief")
    sc_bad = sc.send_command("show ip interfaces brief")

print(f"same text       : {nm_good == sc_good.result}")
print(f"netmiko returns : {type(nm_good).__name__}")
print(f"scrapli returns : {type(sc_good).__name__}")
print(f"bad command     : netmiko gives {type(nm_bad).__name__}, scrapli says failed={sc_bad.failed}")
print("platform names  : netmiko cisco_ios, scrapli cisco_iosxe")</pre>
<pre class="out">AUTO01$ python3 compare.py
same text       : True
netmiko returns : str
scrapli returns : Response
<span class="hl">bad command     : netmiko gives str, scrapli says failed=True</span>
platform names  : netmiko cisco_ios, scrapli cisco_iosxe</pre>
<p>Chaar lines mein teen baatein. Text bilkul same hai, yaani scrapli aur netmiko sach mein ek hi device se ek hi tareeke se baat karte hain. netmiko aapko plain <code>str</code> deta hai, scrapli <code>Response</code>. Aur galat command ke liye netmiko ek <code>str</code> deta hai jisme error hota hai, jabki scrapli kehta hai <code>failed=True</code>. Highlighted line lab ke sawaal ka jawab hai: flag scrapli lagata hai.</p>

<h3>Porting table</h3>
<table class="cmp"><tr><th>Kaam</th><th>netmiko</th><th>scrapli</th></tr>
<tr><td>Kholna</td><td><code>ConnectHandler(**dev)</code></td><td><code>Scrapli(**dev)</code></td></tr>
<tr><td>Platform</td><td><code>device_type="cisco_ios"</code></td><td><code>platform="cisco_iosxe"</code></td></tr>
<tr><td>Login keys</td><td><code>username</code>, <code>password</code>, <code>secret</code></td><td><code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code></td></tr>
<tr><td>Show command</td><td><code>conn.send_command(c)</code> text hai</td><td><code>conn.send_command(c).result</code></td></tr>
<tr><td>Structured</td><td><code>send_command(c, use_textfsm=True)</code></td><td><code>send_command(c).textfsm_parse_output()</code></td></tr>
<tr><td>Configuration</td><td><code>send_config_set(lines)</code></td><td><code>send_configs(lines)</code></td></tr>
<tr><td>Commit (Junos)</td><td><code>conn.commit()</code></td><td>aapki list ke ant mein line <code>"commit"</code></td></tr>
<tr><td>Band karna</td><td><code>disconnect()</code></td><td><code>close()</code></td></tr>
<tr><td>Bad login</td><td><code>NetmikoAuthenticationException</code></td><td><code>ScrapliAuthenticationFailed</code></td></tr>
<tr><td>Unreachable</td><td><code>NetmikoTimeoutException</code></td><td><code>ScrapliConnectionNotOpened</code></td></tr></table>
<p>Lab 1 ki files port ko practice mein dikhati hain: yahan ka <code>common.py</code> adv-nkmiko wala <code>common.py</code> hai naye keys ke saath, explicit loop ki jagah <code>collect()</code>, aur exceptions ke naam badle hue. <code>interfaces.py</code>, <code>backup.py</code> aur NTP push ka logic nahi badla; sirf errors notice karne ka tareeka badla.</p>

<h3>Kab kaunsa chunna hai</h3>
`+e(t,`Platform se shuru karo, phir job ka size, phir team ki aadat.`)+`
<table class="cmp"><tr><th>scrapli chuno jab</th><th>netmiko chuno jab</th></tr>
<tr><td>har command par <code>failed</code> flag aur timing wala Response chahiye</td><td>core paanch ke bahar ka platform chahiye aur extra package nahi chahiye</td></tr>
<tr><td>typed exceptions aur strict argument checking chahiye</td><td>quick one-off script likh rahe ho aur team use pehle se jaanti hai</td></tr>
<tr><td>bada fleet chalate ho aur tez transport (<code>system</code> ya <code>ssh2</code>) ya async variant chahiye</td><td>uske kai built-in helpers methods ke roop mein chahiye, jaise <code>save_config()</code> ya <code>commit()</code></td></tr>
<tr><td><code>nornir_scrapli</code> ke saath Nornir par jaana hai</td><td><code>nornir_netmiko</code> ke saath Nornir par jaana hai, ya aapke tools (NAPALM, IOS ke liye) pehle se use karte hain</td></tr></table>
<p>Dono har device par ek SSH session kholte hain, aur dono <code>py-concurrency</code> ke thread-per-device pattern mein aate hain. Nornir (module <code>adv-nornir</code>) dono mein se kisi ko bhi wrap karta hai, isliye jo yahan seekha woh aage kaam aata hai.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> scrapli ka speed advantage uske transports se aata hai: system OpenSSH client aur C-based <code>ssh2</code> library pure-Python SSH se bahut tez hain, aur <code>asyncssh</code> transport ek process ko bina threads ke kai devices chalane deta hai. Lab apna transport use karta hai aur usme asli network delays nahi hain, isliye yeh dikha nahi sakta. Faisla karne se pehle apne network par naapo. Async scrapli (<code>AsyncScrapli</code>) lab mein available nahi hai. Companion packages <code>scrapli_netconf</code>, <code>scrapli_cfg</code> aur <code>scrapli_community</code> real gear par hain; inme se koi lab mein nahi.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> Sirf naam port karna aur result ko text maanne ki netmiko wali aadat rakhna. scrapli drivers par <code>commit()</code> ya <code>save_config()</code> jaisa method expect karna: lines khud bhejo. Core list ke bahar ke vendor ke liye scrapli chun kar community platforms par ek din barbad karna. Aisi speed claim par chunna jo kabhi naapi nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek device, do libraries, IOS XE ke do naam: netmiko <code>cisco_ios</code>, scrapli <code>cisco_iosxe</code>. Ek library ka naam doosri mein use karna sabse aam pehli galti hai.</p></div>

<div class="scn"><h4>Port mein aadha din, har mahine ek din ki bachat</h4><p>Ek team ne apna backup collector netmiko se scrapli par port kiya. Port aadha din laga, zyadatar arguments ke naam badalne mein. Pehle hafte mein naye <code>raise_for_status()</code> calls ne Junos command table ka typo pakda jise purani job teen mahine se "backups" ke roop mein save karti thi. Unhone dono libraries rakhin: kuch legacy platforms ke liye netmiko, core fleet ke liye scrapli.</p><p><b>Lesson:</b> kaam ke hisaab se chuno; team do libraries side by side chala sakti hai.</p></div>

<div class="iv"><p class="q">"Kya aap chalti hui netmiko script ko scrapli mein rewrite karoge?"</p><p>Sirf fashion ke liye nahi. Tab karunga jab Response object, typed errors ya tez transport chahiye, ya script scrapli plugin ke saath Nornir mein jaati ho. Port mechanical hai: arguments rename karo, <code>.result</code> use karo, <code>use_textfsm</code> ko <code>textfsm_parse_output()</code> banao, aur woh failure checks jodo jo scrapli possible banata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ek device, ek text; farak return type aur failure handling ka hai.</li>
<li>Naam alag: <code>cisco_ios</code> versus <code>cisco_iosxe</code>, <code>username</code> versus <code>auth_username</code>.</li>
<li>scrapli commit aur save ko plain lines ki tarah bhejta hai; netmiko mein methods hain.</li>
<li>Platform coverage, job size aur team ki aadat se chuno; speed claim ko apni khud ki naap chahiye.</li>
<li>Nornir dono libraries use kar sakta hai, isliye skills aage kaam aate hain.</li>
</ul></div>
`}};export{n as default};