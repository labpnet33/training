var e={id:`troubleshooting`,h:{en:`Troubleshooting: Lab 2, the audit that says nothing is wrong`,hi:`Troubleshooting: Lab 2, woh audit jo kehta hai kuch galat nahi`},body:{en:`
<p>This chapter walks Lab 2. The Monday audit script prints three errors, one strange line and a calm exit. There are four faults, and each one is a failure mode from this module: group data, a platform name, a dead host and a filter. The skill is not knowing the answers; it is a method that finds them in order.</p>

<h3>An analogy: the airport journey</h3>
<p>A traveller who does not arrive could have been stopped at check-in (paperwork), at security (documents), at the gate (no flight) or could be in the wrong airport altogether. You check the stages in order and look for the first one that failed. A Nornir run has stages too.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Where a Nornir run can go wrong, in order">
<rect x="6" y="14" width="96" height="58" rx="8" fill="#ddd6fe"/><text x="54" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. data</text><text x="54" y="56" text-anchor="middle" class="svg-muted" font-size="10">KeyError</text>
<rect x="112" y="14" width="96" height="58" rx="8" fill="#fde68a"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. platform</text><text x="160" y="56" text-anchor="middle" class="svg-muted" font-size="10">ValueError</text>
<rect x="218" y="14" width="96" height="58" rx="8" fill="#fed7aa"/><text x="266" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. network</text><text x="266" y="56" text-anchor="middle" class="svg-muted" font-size="10">Timeout</text>
<rect x="324" y="14" width="96" height="58" rx="8" fill="#bbf7d0"/><text x="372" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. login</text><text x="372" y="56" text-anchor="middle" class="svg-muted" font-size="10">Authentication</text>
<rect x="430" y="14" width="96" height="58" rx="8" fill="#bae6fd"/><text x="478" y="38" text-anchor="middle" class="svg-ink" font-size="12">5. command</text><text x="478" y="56" text-anchor="middle" class="svg-muted" font-size="10">text only</text>
<rect x="536" y="14" width="96" height="58" rx="8" fill="#fecaca"/><text x="584" y="38" text-anchor="middle" class="svg-ink" font-size="12">6. selection</text><text x="584" y="56" text-anchor="middle" class="svg-muted" font-size="10">silent</text>
<text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">Stages 1 to 4 raise an exception and fail the host. Stages 5 and 6 raise nothing.</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">Work from left to right: each fix shows the next problem.</text>
</svg><p class="cap">Where a Nornir run can go wrong. The quiet stages on the right need your own checks.</p></div>

<h3>The ticket and the script</h3>
<p>The CMDB lists five hosts. <code>audit.py</code> should print the first line of <code>show version</code> for each, then count the up interfaces on the IOS routers. Its main parts are below. The helper <code>cause()</code> is the idea from chapter 7: it finds the exception that really failed the host, not the wrapper.</p>
<pre class="code">def version(task):
<span class="hl">    command = task.host["version_cmd"]</span>
    out = task.run(task=netmiko_send_command, command_string=command).result
    return out.splitlines()[0]
def cause(multi):
    """The exception that really failed the host (not the NornirSubTaskError wrapper)."""
    for res in multi:
        if res.exception is not None and not isinstance(res.exception, NornirSubTaskError):
            return "%s: %s" % (type(res.exception).__name__, str(res.exception).strip().splitlines()[0])
    return "unknown"
result = nr.run(task=version)
for name, multi in result.items():
    print("%-3s %s" % (name, cause(multi) if multi.failed else "ok  " + multi[0].result))

<span class="hl">ios = nr.filter(platform="ios")</span>
print("interface check on %d IOS hosts" % len(ios.inventory.hosts))</pre>

<h3>Fault 1: the key that is nowhere</h3>
<pre class="out">AUTO01$ python3 audit.py
r1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
<span class="hl">j1  ValueError: Unsupported 'device_type' currently supported platforms are:</span>
e1  ok  Arista vEOS-lab
<span class="hl">n1  KeyError: 'version_cmd'</span>
<span class="hl">r3  NetmikoTimeoutException: TCP connection to device failed.</span>
<span class="hl">interface check on 0 IOS hosts</span></pre>
<p>Three hosts fail with three different exceptions, and the last line looks calm. Start at the stage nearest the data. <code>n1</code> raises <code>KeyError: 'version_cmd'</code>: Nornir looked in the host, the groups and the defaults, and the key is in none of them. Compare the groups.</p>
<pre class="code">junos:
<span class="hl">  platform: junos_os</span>
  data:
    version_cmd: show version
...
nxos:
  platform: cisco_nxos
  password: NKlab@123
  data:
<span class="hl">    version_command: show version</span></pre>
<p>The nxos group says <code>version_command</code> while the others say <code>version_cmd</code>. YAML accepts any key, so the typo shows up only when a task asks for it. Fix the key.</p>
<pre class="out">AUTO01$ sed -i 's/version_command:/version_cmd:/' inventory/groups.yaml
AUTO01$ python3 audit.py
...
<span class="hl">n1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE</span>
...</pre>

<h3>Fault 2: a platform name</h3>
<p><code>j1</code> raises <code>ValueError: Unsupported 'device_type'</code> before it connects at all. The group says <code>platform: junos_os</code>, which is not a Netmiko device type. Stage 2 is the name the plugin understands: <code>juniper_junos</code>.</p>
<pre class="out">AUTO01$ sed -i 's/platform: junos_os/platform: juniper_junos/' inventory/groups.yaml
AUTO01$ python3 audit.py
...
<span class="hl">j1  ok  Hostname: J1</span>
...</pre>

<h3>Fault 3: a dead host</h3>
<p><code>r3</code> raises <code>NetmikoTimeoutException</code>: the address does not answer. Do not guess; test the network. The inventory says <code>10.99.0.33</code>, the CMDB says <code>10.99.0.3</code>.</p>
<pre class="out">AUTO01$ ping -c 2 10.99.0.33
PING 10.99.0.33 (10.99.0.33) 56(84) bytes of data.
<span class="hl">From 10.99.0.60 icmp_seq=1 Destination Host Unreachable</span>
<span class="hl">2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1003ms</span>
AUTO01$ ping -c 2 10.99.0.3
64 bytes from 10.99.0.3: icmp_seq=1 ttl=255 time=0.50 ms
<span class="hl">2 packets transmitted, 2 received, 0% packet loss, time 1003ms</span></pre>
<p>A timeout is the transport stage, not a credentials problem (that would be <code>NetmikoAuthenticationException</code>). The wrong address is a typo in <code>hosts.yaml</code>. Fix it and the router answers.</p>
<pre class="out">AUTO01$ sed -i 's/10.99.0.33/10.99.0.3/' inventory/hosts.yaml
AUTO01$ python3 audit.py
<span class="hl">r3  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE</span></pre>

<h3>Fault 4: the filter that selects nobody</h3>
<p>All five hosts say <code>ok</code>, and the second part still prints <code>interface check on 0 IOS hosts</code>. No error, no exception: this is the quiet stage. The filter asks for <code>platform="ios"</code>, but the inventory calls the platform <code>cisco_ios</code>. An empty filter is valid, so Nornir runs nothing and says nothing. Only the count in the script's own message gives it away.</p>
<pre class="out">AUTO01$ sed -i 's/platform="ios"/platform="cisco_ios"/' audit.py
AUTO01$ python3 audit.py
<span class="hl">interface check on 2 IOS hosts</span>
r1  1 of 4 interfaces up
r3  1 of 4 interfaces up</pre>

<h3>The proof</h3>
<pre class="out"><span class="hl">AUTO01$ python3 audit.py; echo "exit code: $?"</span>
r1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
j1  ok  Hostname: J1
e1  ok  Arista vEOS-lab
n1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
r3  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
interface check on 2 IOS hosts
r1  1 of 4 interfaces up
r3  1 of 4 interfaces up
<span class="hl">exit code: 0</span></pre>
<p>Five hosts <code>ok</code>, two IOS routers checked, exit code 0. The proof has two parts: no failed host, and the number of hosts checked is what you expected.</p>

<div class="warn"><p><b>Common mistake.</b> Fixing the loudest error first and stopping when the output looks calmer. The last fault made no noise at all. After the red lines are gone, check the counts: how many hosts did each step really cover?</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>KeyError</code> means missing data, <code>ValueError: Unsupported 'device_type'</code> means a wrong platform name, <code>NetmikoTimeoutException</code> means no network path, <code>NetmikoAuthenticationException</code> means a wrong login. Match the exception to the stage and the fix is short.</p></div>

<div class="scn"><h4>The green audit with 0 devices</h4><p>A compliance script printed "0 violations" for months. A rename of a group label had made the filter select no hosts, and the loop never ran. The number of checked devices was never printed, so nobody noticed. The fix added one line: "checked N hosts" and a failure when N is zero.</p><p><b>Lesson:</b> a result with no coverage figure is not proof of anything.</p></div>

<div class="iv"><p class="q">"A Nornir script reports no errors but you suspect it did nothing. What do you check?"</p><p>How many hosts the filter selected and how many results came back. An empty filter runs nothing without any error, and a refused command is not a failed host. I print the host count, compare it with the inventory, and make the script exit non-zero when it covered zero hosts.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: data, platform, network, login, command text, selection.</li>
<li>Read the real exception: <code>KeyError</code>, <code>ValueError</code>, timeout and authentication point to different stages.</li>
<li>Test the network with <code>ping</code> before blaming Nornir.</li>
<li>Platform names must match the connection plugin: <code>juniper_junos</code>, not <code>junos_os</code>.</li>
<li>Always print how many hosts a step covered.</li>
</ul></div>
`,hi:`
<p>Yeh chapter Lab 2 chalata hai. Monday ki audit script teen errors, ek ajeeb line aur shant exit print karti hai. Chaar faults hain, aur har ek is module ka ek failure mode hai: group data, platform ka naam, dead host aur filter. Hunar jawab jaanna nahi hai; woh method hai jo unhe order mein dhoondh leta hai.</p>

<h3>Ek analogy: airport ka safar</h3>
<p>Jo musafir nahi pahunchta woh check-in (kaagaz), security (documents), gate (flight nahi) par ruk sakta hai, ya bilkul galat airport par ho sakta hai. Aap stages order mein check karte ho aur pehla fail hua stage dhoondhte ho. Nornir run ke bhi stages hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Where a Nornir run can go wrong, in order">
<rect x="6" y="14" width="96" height="58" rx="8" fill="#ddd6fe"/><text x="54" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. data</text><text x="54" y="56" text-anchor="middle" class="svg-muted" font-size="10">KeyError</text>
<rect x="112" y="14" width="96" height="58" rx="8" fill="#fde68a"/><text x="160" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. platform</text><text x="160" y="56" text-anchor="middle" class="svg-muted" font-size="10">ValueError</text>
<rect x="218" y="14" width="96" height="58" rx="8" fill="#fed7aa"/><text x="266" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. network</text><text x="266" y="56" text-anchor="middle" class="svg-muted" font-size="10">Timeout</text>
<rect x="324" y="14" width="96" height="58" rx="8" fill="#bbf7d0"/><text x="372" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. login</text><text x="372" y="56" text-anchor="middle" class="svg-muted" font-size="10">Authentication</text>
<rect x="430" y="14" width="96" height="58" rx="8" fill="#bae6fd"/><text x="478" y="38" text-anchor="middle" class="svg-ink" font-size="12">5. command</text><text x="478" y="56" text-anchor="middle" class="svg-muted" font-size="10">text only</text>
<rect x="536" y="14" width="96" height="58" rx="8" fill="#fecaca"/><text x="584" y="38" text-anchor="middle" class="svg-ink" font-size="12">6. selection</text><text x="584" y="56" text-anchor="middle" class="svg-muted" font-size="10">silent</text>
<text x="320" y="106" text-anchor="middle" class="svg-muted" font-size="12">Stages 1 to 4 raise an exception and fail the host. Stages 5 and 6 raise nothing.</text>
<text x="320" y="128" text-anchor="middle" class="svg-muted" font-size="12">Work from left to right: each fix shows the next problem.</text>
</svg><p class="cap">Where a Nornir run can go wrong. The quiet stages on the right need your own checks.</p></div>

<h3>Ticket aur script</h3>
<p>CMDB paanch hosts list karta hai. <code>audit.py</code> ko har ek ke liye <code>show version</code> ki pehli line print karni hai, phir IOS routers ke up interfaces ginne hain. Uske mukhya hisse neeche hain. Helper <code>cause()</code> chapter 7 ka idea hai: yeh woh exception dhoondhta hai jisne host ko asal mein fail kiya, wrapper nahi.</p>
<pre class="code">def version(task):
<span class="hl">    command = task.host["version_cmd"]</span>
    out = task.run(task=netmiko_send_command, command_string=command).result
    return out.splitlines()[0]
def cause(multi):
    """The exception that really failed the host (not the NornirSubTaskError wrapper)."""
    for res in multi:
        if res.exception is not None and not isinstance(res.exception, NornirSubTaskError):
            return "%s: %s" % (type(res.exception).__name__, str(res.exception).strip().splitlines()[0])
    return "unknown"
result = nr.run(task=version)
for name, multi in result.items():
    print("%-3s %s" % (name, cause(multi) if multi.failed else "ok  " + multi[0].result))

<span class="hl">ios = nr.filter(platform="ios")</span>
print("interface check on %d IOS hosts" % len(ios.inventory.hosts))</pre>

<h3>Fault 1: woh key jo kahin nahi hai</h3>
<pre class="out">AUTO01$ python3 audit.py
r1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
<span class="hl">j1  ValueError: Unsupported 'device_type' currently supported platforms are:</span>
e1  ok  Arista vEOS-lab
<span class="hl">n1  KeyError: 'version_cmd'</span>
<span class="hl">r3  NetmikoTimeoutException: TCP connection to device failed.</span>
<span class="hl">interface check on 0 IOS hosts</span></pre>
<p>Teen hosts teen alag exceptions se fail hote hain, aur aakhri line shant dikhti hai. Data ke sabse paas wale stage se shuru karo. <code>n1</code> <code>KeyError: 'version_cmd'</code> uthata hai: Nornir ne host, groups aur defaults dekhe, aur key kisi mein nahi hai. Groups ko compare karo.</p>
<pre class="code">junos:
<span class="hl">  platform: junos_os</span>
  data:
    version_cmd: show version
...
nxos:
  platform: cisco_nxos
  password: NKlab@123
  data:
<span class="hl">    version_command: show version</span></pre>
<p>nxos group <code>version_command</code> kehta hai jabki baaki <code>version_cmd</code>. YAML har key maanta hai, isliye typo tabhi dikhta hai jab task use maange. Key theek karo.</p>
<pre class="out">AUTO01$ sed -i 's/version_command:/version_cmd:/' inventory/groups.yaml
AUTO01$ python3 audit.py
...
<span class="hl">n1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE</span>
...</pre>

<h3>Fault 2: platform ka naam</h3>
<p><code>j1</code> connect karne se pehle hi <code>ValueError: Unsupported 'device_type'</code> uthata hai. Group <code>platform: junos_os</code> kehta hai, jo Netmiko ka device type nahi hai. Stage 2 woh naam hai jo plugin samajhta hai: <code>juniper_junos</code>.</p>
<pre class="out">AUTO01$ sed -i 's/platform: junos_os/platform: juniper_junos/' inventory/groups.yaml
AUTO01$ python3 audit.py
...
<span class="hl">j1  ok  Hostname: J1</span>
...</pre>

<h3>Fault 3: dead host</h3>
<p><code>r3</code> <code>NetmikoTimeoutException</code> uthata hai: address jawab nahi deta. Andaaza mat lagao; network test karo. Inventory <code>10.99.0.33</code> kehti hai, CMDB <code>10.99.0.3</code>.</p>
<pre class="out">AUTO01$ ping -c 2 10.99.0.33
PING 10.99.0.33 (10.99.0.33) 56(84) bytes of data.
<span class="hl">From 10.99.0.60 icmp_seq=1 Destination Host Unreachable</span>
<span class="hl">2 packets transmitted, 0 received, +2 errors, 100% packet loss, time 1003ms</span>
AUTO01$ ping -c 2 10.99.0.3
64 bytes from 10.99.0.3: icmp_seq=1 ttl=255 time=0.50 ms
<span class="hl">2 packets transmitted, 2 received, 0% packet loss, time 1003ms</span></pre>
<p>Timeout transport stage hai, credentials ki problem nahi (woh <code>NetmikoAuthenticationException</code> hoti). Galat address <code>hosts.yaml</code> ka typo hai. Theek karo to router jawab deta hai.</p>
<pre class="out">AUTO01$ sed -i 's/10.99.0.33/10.99.0.3/' inventory/hosts.yaml
AUTO01$ python3 audit.py
<span class="hl">r3  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE</span></pre>

<h3>Fault 4: filter jo kisi ko select nahi karta</h3>
<p>Paanchon hosts <code>ok</code> kehte hain, aur doosra hissa phir bhi <code>interface check on 0 IOS hosts</code> print karta hai. Na error, na exception: yeh shant stage hai. Filter <code>platform="ios"</code> maangta hai, par inventory platform ko <code>cisco_ios</code> kehti hai. Khaali filter valid hai, isliye Nornir kuch nahi chalata aur kuch nahi kehta. Sirf script ke apne message ka count ise pakadta hai.</p>
<pre class="out">AUTO01$ sed -i 's/platform="ios"/platform="cisco_ios"/' audit.py
AUTO01$ python3 audit.py
<span class="hl">interface check on 2 IOS hosts</span>
r1  1 of 4 interfaces up
r3  1 of 4 interfaces up</pre>

<h3>Saboot</h3>
<pre class="out"><span class="hl">AUTO01$ python3 audit.py; echo "exit code: $?"</span>
r1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
j1  ok  Hostname: J1
e1  ok  Arista vEOS-lab
n1  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
r3  ok  Network Kings Network OS Software, NK-OS Software, Version 2.0, RELEASE SOFTWARE
interface check on 2 IOS hosts
r1  1 of 4 interfaces up
r3  1 of 4 interfaces up
<span class="hl">exit code: 0</span></pre>
<p>Paanch hosts <code>ok</code>, do IOS routers check hue, exit code 0. Saboot ke do hisse hain: koi failed host nahi, aur check kiye gaye hosts ki sankhya wahi hai jo aap expect karte the.</p>

<div class="warn"><p><b>Common mistake.</b> Sabse zor ki error pehle theek karna aur output shant dikhte hi ruk jaana. Aakhri fault ne koi shor nahi kiya. Laal lines jaane ke baad counts check karo: har step ne asal mein kitne hosts cover kiye?</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>KeyError</code> matlab data missing, <code>ValueError: Unsupported 'device_type'</code> matlab galat platform naam, <code>NetmikoTimeoutException</code> matlab network path nahi, <code>NetmikoAuthenticationException</code> matlab galat login. Exception ko stage se milao to fix chhota hota hai.</p></div>

<div class="scn"><h4>Hara audit, 0 devices</h4><p>Ek compliance script mahino tak "0 violations" print karti rahi. Group label ke rename se filter ne koi host select nahi kiya, aur loop kabhi chala hi nahi. Check kiye gaye devices ki sankhya kabhi print nahi hui, isliye kisi ko pata nahi chala. Fix ek line thi: "checked N hosts" aur N zero ho to failure.</p><p><b>Lesson:</b> jis result mein coverage ka figure nahi, woh kisi cheez ka saboot nahi.</p></div>

<div class="iv"><p class="q">"Nornir script koi error nahi kehti par aapko shak hai ki usne kuch kiya hi nahi. Kya check karoge?"</p><p>Filter ne kitne hosts select kiye aur kitne results aaye. Khaali filter bina error ke kuch nahi chalata, aur refused command failed host nahi hota. Main host count print karta hoon, inventory se milata hoon, aur script ko zero hosts cover karne par non-zero exit karata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein kaam karo: data, platform, network, login, command text, selection.</li>
<li>Asli exception padho: <code>KeyError</code>, <code>ValueError</code>, timeout aur authentication alag stages batate hain.</li>
<li>Nornir ko doshi thehrane se pehle <code>ping</code> se network test karo.</li>
<li>Platform names connection plugin se milne chahiye: <code>juniper_junos</code>, <code>junos_os</code> nahi.</li>
<li>Hamesha print karo ki step ne kitne hosts cover kiye.</li>
</ul></div>
`}};export{e as default};