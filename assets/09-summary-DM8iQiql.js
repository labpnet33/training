var e=`<pre class="code"><span class="c"># open</span>
from scrapli import Scrapli
conn = Scrapli(platform="cisco_iosxe", host="10.99.0.1", auth_username="netops",
               auth_password=PASSWORD, auth_secondary=PASSWORD, auth_strict_key=False)
with conn: ...                      <span class="c"># or conn.open() ... conn.close()</span>

<span class="c"># read</span>
r = conn.send_command("show ip interface brief")
r.result   r.failed   r.channel_input   r.elapsed_time
r.raise_for_status()                <span class="c"># ScrapliCommandFailure if failed</span>
rows = r.textfsm_parse_output()     <span class="c"># [] when no template or no match</span>
many = conn.send_commands([...], stop_on_failed=True)   <span class="c"># MultiResponse</span>

<span class="c"># change</span>
conn.send_configs(["line 1", "line 2"], stop_on_failed=True)   <span class="c"># Junos: end with "commit"</span>
conn.send_config("line 1\\nline 2")  <span class="c"># one string, one Response</span>
conn.send_command(CMD, failed_when_contains=["% "])

<span class="c"># state</span>
conn.get_prompt()   conn.acquire_priv("configuration")   conn.isalive()</pre>`,t={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p><b>The idea of this chapter:</b> one page to review before an exam, an interview or a change window. You built a three-vendor toolkit with scrapli, compared it with netmiko, and fixed six failures, one of which printed no error at all.</p>

<h3>Can-do checklist</h3>
<ul>
<li>I can open sessions on IOS XE, Junos and EOS with <code>Scrapli(platform=...)</code> and a <code>with</code> block, with credentials from .env.</li>
<li>I can name the five core platforms and the netmiko name that goes with each.</li>
<li>I can read a <code>Response</code>: <code>result</code>, <code>failed</code>, <code>channel_input</code>, <code>elapsed_time</code>.</li>
<li>I know that <code>bool(response)</code> is <code>response.failed</code>.</li>
<li>I can parse output with <code>textfsm_parse_output()</code> and handle the empty list, with a regex fallback for Junos.</li>
<li>I can back up configurations with <code>raise_for_status()</code> and push a change with <code>send_configs</code>, <code>commit</code> on Junos, <code>stop_on_failed</code> and a read-back.</li>
<li>I can tell the three timeouts apart and I retry connection errors but never authentication errors.</li>
<li>I can read a scrapli exception and name the stage, and I can port a netmiko script.</li>
<li>I can explain when to use scrapli and when to use netmiko.</li>
</ul>

<h3>Most-tested facts</h3>
<ul>
<li>Core platforms: <code>cisco_iosxe</code>, <code>cisco_iosxr</code>, <code>cisco_nxos</code>, <code>arista_eos</code>, <code>juniper_junos</code>. Anything else: <code>ScrapliModuleNotFound</code>.</li>
<li>Argument names: <code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code> (enable), <code>auth_strict_key</code>.</li>
<li><code>send_command</code> returns <code>Response</code>; <code>send_commands</code> and <code>send_configs</code> return <code>MultiResponse</code>; <code>send_config</code> returns one <code>Response</code>.</li>
<li><code>send_configs</code> needs a list; a string gives <code>ScrapliTypeError</code>. It never commits or saves.</li>
<li><code>failed</code> comes from string matching with <code>failed_when_contains</code>; unlisted errors are invisible.</li>
<li>Timeouts: socket (TCP), transport (SSH), ops (one operation); defaults 15, 30, 30 seconds on real gear.</li>
<li>Wrong password: <code>ScrapliAuthenticationFailed</code>. Dead host, closed port, wrong driver prompt, command before <code>open()</code>: <code>ScrapliConnectionNotOpened</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Driver</dt><dd>the class for one platform (<code>IOSXEDriver</code>, <code>JunosDriver</code>); it knows prompts, privilege levels and error strings.</dd>
<dt>Channel</dt><dd>the layer that sends text and reads until the prompt returns.</dd>
<dt>Transport</dt><dd>the SSH carrier: system, ssh2, paramiko, asyncssh or telnet on real gear.</dd>
<dt>Response</dt><dd>the object a command returns, with result, failed flag and timing.</dd>
<dt>MultiResponse</dt><dd>a list-like set of Responses; <code>failed</code> is true if any element failed.</dd>
<dt>failed_when_contains</dt><dd>the strings that mark an output as failed.</dd>
<dt>Privilege level</dt><dd>exec, privilege_exec or configuration; scrapli moves between them for you.</dd>
<dt>Idempotent</dt><dd>running the script twice leaves the same state as running it once.</dd>
</dl>

<h3>Cheat-sheet</h3>
`+e+`

<h3>Where this goes next</h3>
<p><code>adv-nornir</code> runs scrapli or netmiko tasks across a whole inventory with threads, results and failed hosts handled for you. <code>adv-napalm</code> gives vendor-neutral getters and configuration diffs. <code>adv-verify</code> shows how to check a change before you push it. Your Lab 1 toolkit is the plain-Python version of all three.</p>

<div class="warn"><p><b>Last reminders.</b> Never put passwords in code. Never retry a failed login. Never trust <code>Success: True</code> without a read-back. Never raise a timeout before you have read the message.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions love the pairs: <code>cisco_ios</code> and <code>cisco_iosxe</code>; <code>secret</code> and <code>auth_secondary</code>; string and list for <code>send_configs</code>; <code>if response:</code> meaning failure.</p></div>

<div class="scn"><h4>The change that verified itself</h4><p>A team's change script now ends every push with a read-back, prints a one-line verdict per device and exits with code 1 if any device is not in the intended state. Their dashboards finally agree with the devices. The cost was ten lines of code and a rule in review: no push without a read-back.</p><p><b>Lesson:</b> automate the proof, not only the change.</p></div>

<div class="iv"><p class="q">"Summarise scrapli in thirty seconds."</p><p>A strict, small SSH library for network devices. One factory call with a platform name, a Response for every command with a failed flag and timing, typed exceptions, TextFSM parsing, send_configs for changes, and swappable transports for speed on real networks. I check <code>failed</code>, read state back after changes, retry network errors and never authentication errors.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>scrapli = factory + driver + channel + transport; every command is a Response.</li>
<li>Check <code>failed</code>, widen <code>failed_when_contains</code> where needed, read state back.</li>
<li>Timeouts guard stages; exceptions name them; retry the network, never the password.</li>
<li>Junos needs <code>commit</code> as a line; IOS XE needs a save as a command.</li>
<li>Choose scrapli or netmiko per job, and measure speed claims yourself.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> exam, interview ya change window se pehle review karne ke liye ek page. Aapne scrapli se teen-vendor toolkit banaya, use netmiko se compare kiya, aur chhe failures theek kiye, jinme se ek ne koi error print hi nahi kiya.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Main <code>Scrapli(platform=...)</code> aur <code>with</code> block se IOS XE, Junos aur EOS par sessions khol sakta hoon, credentials .env se.</li>
<li>Main paanch core platforms aur har ek ke saath jaane wala netmiko naam bata sakta hoon.</li>
<li>Main <code>Response</code> padh sakta hoon: <code>result</code>, <code>failed</code>, <code>channel_input</code>, <code>elapsed_time</code>.</li>
<li>Main jaanta hoon ki <code>bool(response)</code> barabar hai <code>response.failed</code>.</li>
<li>Main <code>textfsm_parse_output()</code> se output parse kar sakta hoon aur khaali list sambhal sakta hoon, Junos ke liye regex fallback ke saath.</li>
<li>Main <code>raise_for_status()</code> se configurations backup kar sakta hoon aur <code>send_configs</code>, Junos par <code>commit</code>, <code>stop_on_failed</code> aur read-back ke saath change push kar sakta hoon.</li>
<li>Main teen timeouts mein farak bata sakta hoon aur connection errors retry karta hoon par authentication errors kabhi nahi.</li>
<li>Main scrapli exception padh kar stage bata sakta hoon, aur netmiko script port kar sakta hoon.</li>
<li>Main samjha sakta hoon ki scrapli kab use karna hai aur netmiko kab.</li>
</ul>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>Core platforms: <code>cisco_iosxe</code>, <code>cisco_iosxr</code>, <code>cisco_nxos</code>, <code>arista_eos</code>, <code>juniper_junos</code>. Baaki sab: <code>ScrapliModuleNotFound</code>.</li>
<li>Argument naam: <code>auth_username</code>, <code>auth_password</code>, <code>auth_secondary</code> (enable), <code>auth_strict_key</code>.</li>
<li><code>send_command</code> <code>Response</code> lautata hai; <code>send_commands</code> aur <code>send_configs</code> <code>MultiResponse</code>; <code>send_config</code> ek <code>Response</code>.</li>
<li><code>send_configs</code> ko list chahiye; string par <code>ScrapliTypeError</code>. Woh commit ya save kabhi nahi karta.</li>
<li><code>failed</code> <code>failed_when_contains</code> se string matching se aata hai; unlisted errors dikhte hi nahi.</li>
<li>Timeouts: socket (TCP), transport (SSH), ops (ek operation); real gear par defaults 15, 30, 30 seconds.</li>
<li>Galat password: <code>ScrapliAuthenticationFailed</code>. Dead host, band port, galat driver ka prompt, <code>open()</code> se pehle command: <code>ScrapliConnectionNotOpened</code>.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Driver</dt><dd>ek platform ki class (<code>IOSXEDriver</code>, <code>JunosDriver</code>); woh prompts, privilege levels aur error strings jaanti hai.</dd>
<dt>Channel</dt><dd>woh layer jo text bhejti hai aur prompt wapas aane tak padhti hai.</dd>
<dt>Transport</dt><dd>SSH carrier: real gear par system, ssh2, paramiko, asyncssh ya telnet.</dd>
<dt>Response</dt><dd>command jo object lautati hai, result, failed flag aur timing ke saath.</dd>
<dt>MultiResponse</dt><dd>Responses ka list-jaisa set; koi element fail ho to <code>failed</code> true.</dd>
<dt>failed_when_contains</dt><dd>woh strings jo output ko failed mark karti hain.</dd>
<dt>Privilege level</dt><dd>exec, privilege_exec ya configuration; scrapli unke beech aapke liye jaata hai.</dd>
<dt>Idempotent</dt><dd>script do baar chalane se wahi state rehti hai jo ek baar chalane se.</dd>
</dl>

<h3>Cheat-sheet</h3>
`+e+`

<h3>Yeh aage kahan jaata hai</h3>
<p><code>adv-nornir</code> scrapli ya netmiko tasks ko poore inventory par threads ke saath chalata hai, results aur failed hosts sambhaal kar. <code>adv-napalm</code> vendor-neutral getters aur configuration diffs deta hai. <code>adv-verify</code> dikhata hai ki change push karne se pehle use kaise check karna hai. Aapka Lab 1 toolkit in teeno ka plain-Python version hai.</p>

<div class="warn"><p><b>Aakhri yaad-dahaniyan.</b> Passwords code mein kabhi nahi. Failed login kabhi retry nahi. Read-back ke bina <code>Success: True</code> par bharosa nahi. Message padhne se pehle timeout kabhi nahi badhana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal jodiyon ko pasand karte hain: <code>cisco_ios</code> aur <code>cisco_iosxe</code>; <code>secret</code> aur <code>auth_secondary</code>; <code>send_configs</code> ke liye string aur list; <code>if response:</code> ka matlab failure.</p></div>

<div class="scn"><h4>Woh change jisne khud ko verify kiya</h4><p>Ek team ki change script ab har push ko read-back se khatam karti hai, har device ke liye ek-line verdict print karti hai aur koi device intended state mein na ho to code 1 se exit karti hai. Unke dashboards ab devices se match karte hain. Keemat dus lines ka code aur review mein ek niyam thi: read-back ke bina push nahi.</p><p><b>Lesson:</b> sirf change nahi, saboot bhi automate karo.</p></div>

<div class="iv"><p class="q">"scrapli ko tees second mein summarise karo."</p><p>Network devices ke liye strict, chhoti SSH library. Platform naam ke saath ek factory call, har command ke liye failed flag aur timing wala Response, typed exceptions, TextFSM parsing, changes ke liye send_configs, aur real networks par speed ke liye badalne layak transports. Main <code>failed</code> check karta hoon, change ke baad state wapas padhta hoon, network errors retry karta hoon aur authentication errors kabhi nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>scrapli = factory + driver + channel + transport; har command ek Response hai.</li>
<li><code>failed</code> check karo, jahan zaroori ho <code>failed_when_contains</code> badhao, state wapas padho.</li>
<li>Timeouts stages ki raksha karte hain; exceptions unka naam batate hain; network retry karo, password kabhi nahi.</li>
<li>Junos ko <code>commit</code> line ke roop mein chahiye; IOS XE ko save command ke roop mein.</li>
<li>Kaam ke hisaab se scrapli ya netmiko chuno, aur speed claims khud naapo.</li>
</ul></div>
`}};export{t as default};