var e={id:`config-every-vendor`,h:{en:`Configuration on every vendor: mode, commit and save`,hi:`Har vendor par configuration: mode, commit aur save`},body:{en:`
<p><b>The idea of this chapter:</b> sending config lines is the same call everywhere, <code>send_config_set</code>, but what happens <i>after</i> the lines are accepted is different. On IOS they are live at once. On Junos they are only a draft until you commit. If your script forgets the last step for a vendor, it reports success and changes nothing.</p>

<h3>Analogy: three ways to edit a menu board</h3>
<p>On <b>IOS, NX-OS, ASA and FortiOS</b> you write on the live menu board: customers see each change as you make it. On <b>Junos and PAN-OS</b> you edit a copy on your desk and press "publish" (commit). <b>EOS configuration sessions</b> are a named draft you can publish (commit) or tear up (abort). A separate question is whether the board survives a power cut: that is <i>save</i>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Live edit versus candidate with commit versus named session">
<rect x="5" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">Live edit</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="10">IOS · NX-OS · ASA · FortiOS</text>
<rect x="25" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="105" y="83" text-anchor="middle" class="svg-ink" font-size="11">config lines: live now</text>
<rect x="25" y="110" width="160" height="32" rx="6" fill="#fde68a"/><text x="105" y="131" text-anchor="middle" class="svg-ink" font-size="11">save_config (not Fortinet)</text>
<line x1="105" y1="94" x2="105" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Candidate + commit</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="10">Junos · PAN-OS</text>
<rect x="240" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="11">set lines: draft only</text>
<rect x="240" y="110" width="160" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="11">commit(): live and kept</text>
<line x1="320" y1="94" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="435" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">Named session</text><text x="535" y="48" text-anchor="middle" class="svg-muted" font-size="10">EOS: configure session NAME</text>
<rect x="455" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="535" y="83" text-anchor="middle" class="svg-ink" font-size="11">lines: pending in session</text>
<rect x="455" y="110" width="75" height="32" rx="6" fill="#bbf7d0"/><text x="492" y="131" text-anchor="middle" class="svg-ink" font-size="11">commit</text>
<rect x="540" y="110" width="75" height="32" rx="6" fill="#fed7aa"/><text x="577" y="131" text-anchor="middle" class="svg-ink" font-size="11">abort</text>
<line x1="500" y1="94" x2="492" y2="110" stroke="#64748b" stroke-width="2"/><line x1="570" y1="94" x2="577" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Three models. The collector must know which one each device uses, and take the extra step.</p></div>

<table class="cmp"><tr><th>device_type</th><th>Push</th><th>Make it live</th><th>Keep across reload</th></tr>
<tr><td><code>cisco_ios</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (write memory)</td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (copy running-config startup-config)</td></tr>
<tr><td><code>arista_eos</code></td><td><code>send_config_set</code>, or a session</td><td>automatic, or <code>commit</code> in a session</td><td><code>save_config()</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>send_config_set(exit_config_mode=False)</code></td><td><code>commit()</code></td><td>the commit; <code>save_config()</code> raises <code>NotImplementedError</code></td></tr>
<tr><td><code>fortinet</code></td><td><code>send_config_set</code> with <code>config ... end</code> lines</td><td>automatic</td><td>automatic; <code>save_config()</code> not implemented</td></tr>
<tr><td><code>paloalto_panos</code></td><td><code>send_config_set(exit_config_mode=False)</code></td><td><code>commit()</code></td><td>the commit</td></tr>
<tr><td><code>cisco_asa</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (write mem)</td></tr></table>

<h3>IOS, NX-OS and ASA: live edit</h3>
<pre class="out">AUTO01$ python3 ch6a.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
PUN-CORE-R1(config)#interface Loopback10
PUN-CORE-R1(config-if)#description netmiko
PUN-CORE-R1(config-if)#ip address 10.10.10.10 255.255.255.255
PUN-CORE-R1(config-if)#bogus
                       ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config-if)#end
PUN-CORE-R1#</pre>
<p><code>send_config_set</code> returns the whole config dialogue. The mistake on the <code>bogus</code> line is <b>returned, not raised</b>. To make netmiko raise, pass <code>error_pattern</code>:</p>
<pre class="code">try:
    conn.send_config_set(["interface Loopback11", "bogus"], error_pattern=r"Invalid input")
except ConfigInvalidException as err:
    print("ConfigInvalidException:", str(err).splitlines()[0])
    print("still in config mode:", conn.check_config_mode())
    conn.exit_config_mode()                 <span class="c"># leave config mode before reusing the connection</span>
print(conn.save_config())</pre>
<pre class="out">ConfigInvalidException: Invalid input detected at command: bogus, matched error: Invalid input
still in config mode: True
write mem
Building configuration...
[OK]
PUN-CORE-R1#</pre>
<p>On NX-OS the same pattern ends with <code>save_config()</code> running <code>copy running-config startup-config</code>, and the device prints <code>Copy complete.</code>.</p>

<h3>EOS: a named configuration session</h3>
<pre class="code">e.config_mode(config_command="configure session NKS")      <span class="c"># prompt: E1(config-session)#</span>
e.send_command_timing("interface Loopback6")
e.send_command_timing("ip address 10.6.6.6/32")
print(e.send_command_timing("show session-config diffs"))   <span class="c"># review before you commit</span>
print(e.send_command_timing("commit"))</pre>
<pre class="out">--- system:/running-config
+++ session:/NKS-session-config
@@ -13,6 +13,9 @@
    no switchport
    ip address 10.99.0.21/24
 !
<span class="hl">+interface Loopback6</span>
<span class="hl">+   ip address 10.6.6.6/32</span>
<span class="hl">+!</span>
 username netops privilege 15 secret sha512 $6$nk.....$...................................................................sU.................
 !
 end
Commit complete.
E1#</pre>
<p>Replace <code>commit</code> with <code>abort</code> and the lab answers <code>Session aborted; running configuration unchanged.</code>: the session is thrown away and nothing changed.</p>

<h3>Junos: candidate, check, confirm, commit</h3>
<pre class="out">AUTO01$ python3 ch6c.py
configure
Entering configuration mode

[edit]
netops@J1#set system ntp server 10.99.0.1
netops@J1#
[edit system]
+   ntp {
+       server 10.99.0.1;
+   }

commit check
<span class="hl">configuration check succeeds</span>

[edit]
netops@J1#
commit confirmed 5 comment "add ntp"
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

# commit confirmed will be rolled back in 5 minutes

[edit]
netops@J1#
commit comment "confirmed"
commit complete</pre>
<p>In code that is <code>conn.send_config_set(lines, exit_config_mode=False)</code>, then <code>conn.commit(check=True)</code>, then <code>conn.commit(comment="add ntp", confirm=True, confirm_delay=5, and_quit=False)</code> and a final <code>conn.commit(comment="confirmed")</code>. A <b>commit confirmed</b> rolls back by itself if you lose the box, the safest way to change a remote router. <code>commit()</code> raises <code>ValueError("Commit failed with the following errors: ...")</code> when the device rejects the commit. Two more facts: a session that ran <code>configure exclusive</code> holds a database lock, and a second session gets <code>error: configuration database locked by:</code> until the first one leaves; and <code>save_config()</code> raises <code>NotImplementedError</code> because a commit already saves.</p>

<h3>FortiOS, PAN-OS and ASA</h3>
<pre class="out">config system global
FGT1 (global) # set admintimeout 10
FGT1 (global) # end
FGT1 #
...
admin@PA1#commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span></pre>
<p>FortiOS has no <code>configure</code> word: you send the real block lines (<code>config system global</code>, <code>set ...</code>, <code>end</code>) as they are, and each <code>end</code> applies the change. PAN-OS works like Junos: <code>set</code> lines, then <code>commit()</code> and the success sentence. ASA behaves like IOS and saves with <code>write mem</code>.</p>

<h3>One push function for all of them</h3>
<pre class="code">def push(conn, kind, lines):
    if kind in ("juniper_junos", "paloalto_panos"):
        out = conn.send_config_set(lines, exit_config_mode=False)
        out += conn.commit(comment="pushed by netmiko")
        conn.exit_config_mode()
    else:
        out = conn.send_config_set(lines)
        if kind != "fortinet":
            out += conn.save_config()
    return out</pre>
<pre class="out">cisco_ios       pushed 2 line(s), 9 lines of device output, prompt PUN-CORE-R1#
cisco_nxos      pushed 2 line(s), 10 lines of device output, prompt N1#
arista_eos      pushed 2 line(s), 8 lines of device output, prompt E1#
juniper_junos   pushed 1 line(s), 10 lines of device output, prompt netops@J1&gt;
fortinet        pushed 3 line(s), 4 lines of device output, prompt FGT1 #
paloalto_panos  pushed 1 line(s), 16 lines of device output, prompt admin@PA1&gt;
cisco_asa       pushed 1 line(s), 10 lines of device output, prompt ASA1#</pre>

<div class="warn"><p><b>Common mistakes.</b> Calling <code>send_config_set</code> on Junos with the default <code>exit_config_mode=True</code>: netmiko answers "yes" to "Exit with uncommitted changes?" and your draft is discarded. Calling <code>save_config()</code> on Junos or FortiOS. Reusing a connection after <code>ConfigInvalidException</code> without leaving config mode. Pushing to a router without a rollback plan: use <code>commit confirmed</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Config accepted" is not "config active". On Junos and PAN-OS nothing is live before <code>commit</code>; on IOS-like boxes it is live but not saved until <code>write memory</code> or <code>copy running-config startup-config</code>.</p></div>

<div class="scn"><h4>NTP "pushed" to 30 Junos routers, 0 changed</h4><p>An engineer reused an IOS push script for the Juniper edge. Every run printed success because no exception occurred. A week later monitoring showed clocks drifting. The script had never committed, and netmiko's default exit discarded each draft.</p><p><b>Lesson:</b> verify the result from the device (<code>show configuration system ntp</code>), and make the commit step part of the Junos branch.</p></div>

<div class="iv"><p class="q">"How does pushing config differ between IOS and Junos in netmiko?"</p><p>IOS takes lines through <code>send_config_set</code> and they are live at once; I add <code>save_config</code>. Junos keeps them in a candidate, so I pass <code>exit_config_mode=False</code>, call <code>commit()</code> (often with confirm and a comment), then leave config mode. I always read the config back to prove it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three models: live edit (IOS, NX-OS, ASA, FortiOS), candidate and commit (Junos, PAN-OS), named session (EOS).</li>
<li>Config errors are returned as text unless you set <code>error_pattern</code>; leave config mode after <code>ConfigInvalidException</code>.</li>
<li>Junos: <code>exit_config_mode=False</code>, then <code>commit()</code>; prefer <code>commit(confirm=True)</code> on remote devices.</li>
<li><code>save_config()</code> exists for IOS, NX-OS, EOS and ASA; it is not implemented on Junos and FortiOS.</li>
<li>Always read the configuration back from the device.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> config lines bhejna har jagah ek hi call hai, <code>send_config_set</code>, par lines accept hone ke <i>baad</i> kya hota hai woh alag hai. IOS par woh turant live ho jaati hain. Junos par jab tak commit na karo woh sirf draft hain. Agar aapki script kisi vendor ke liye aakhri step bhool jaye, to woh success report karti hai aur kuch badalti nahi.</p>

<h3>Analogy: menu board edit karne ke teen tareeke</h3>
<p><b>IOS, NX-OS, ASA aur FortiOS</b> par aap live menu board par likhte ho: customers har badlaav tabhi dekhte hain. <b>Junos aur PAN-OS</b> par aap apni desk par copy edit karte ho aur "publish" (commit) dabate ho. <b>EOS configuration sessions</b> naam wala draft hain jise publish (commit) ya phaad (abort) sakte ho. Alag sawaal yeh hai ki board bijli jaane par bachta hai ya nahi: yeh <i>save</i> hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Live edit versus candidate with commit versus named session">
<rect x="5" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="105" y="32" text-anchor="middle" class="svg-ink" font-size="13">Live edit</text><text x="105" y="48" text-anchor="middle" class="svg-muted" font-size="10">IOS · NX-OS · ASA · FortiOS</text>
<rect x="25" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="105" y="83" text-anchor="middle" class="svg-ink" font-size="11">config lines: abhi live</text>
<rect x="25" y="110" width="160" height="32" rx="6" fill="#fde68a"/><text x="105" y="131" text-anchor="middle" class="svg-ink" font-size="11">save_config (Fortinet nahi)</text>
<line x1="105" y1="94" x2="105" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="220" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="13">Candidate + commit</text><text x="320" y="48" text-anchor="middle" class="svg-muted" font-size="10">Junos · PAN-OS</text>
<rect x="240" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="11">set lines: sirf draft</text>
<rect x="240" y="110" width="160" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="131" text-anchor="middle" class="svg-ink" font-size="11">commit(): live aur kept</text>
<line x1="320" y1="94" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="435" y="10" width="200" height="170" rx="10" fill="#e2e8f0"/><text x="535" y="32" text-anchor="middle" class="svg-ink" font-size="13">Named session</text><text x="535" y="48" text-anchor="middle" class="svg-muted" font-size="10">EOS: configure session NAME</text>
<rect x="455" y="62" width="160" height="32" rx="6" fill="#bae6fd"/><text x="535" y="83" text-anchor="middle" class="svg-ink" font-size="11">lines: session mein pending</text>
<rect x="455" y="110" width="75" height="32" rx="6" fill="#bbf7d0"/><text x="492" y="131" text-anchor="middle" class="svg-ink" font-size="11">commit</text>
<rect x="540" y="110" width="75" height="32" rx="6" fill="#fed7aa"/><text x="577" y="131" text-anchor="middle" class="svg-ink" font-size="11">abort</text>
<line x1="500" y1="94" x2="492" y2="110" stroke="#64748b" stroke-width="2"/><line x1="570" y1="94" x2="577" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Teen models. Collector ko pata hona chahiye ki har device kaun sa use karta hai, aur extra step lena hai.</p></div>

<table class="cmp"><tr><th>device_type</th><th>Push</th><th>Live karna</th><th>Reload ke baad bachana</th></tr>
<tr><td><code>cisco_ios</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (write memory)</td></tr>
<tr><td><code>cisco_nxos</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (copy running-config startup-config)</td></tr>
<tr><td><code>arista_eos</code></td><td><code>send_config_set</code>, ya session</td><td>automatic, ya session mein <code>commit</code></td><td><code>save_config()</code></td></tr>
<tr><td><code>juniper_junos</code></td><td><code>send_config_set(exit_config_mode=False)</code></td><td><code>commit()</code></td><td>commit khud; <code>save_config()</code> <code>NotImplementedError</code> deta hai</td></tr>
<tr><td><code>fortinet</code></td><td><code>send_config_set</code> aur <code>config ... end</code> lines</td><td>automatic</td><td>automatic; <code>save_config()</code> implemented nahi</td></tr>
<tr><td><code>paloalto_panos</code></td><td><code>send_config_set(exit_config_mode=False)</code></td><td><code>commit()</code></td><td>commit khud</td></tr>
<tr><td><code>cisco_asa</code></td><td><code>send_config_set</code></td><td>automatic</td><td><code>save_config()</code> (write mem)</td></tr></table>

<h3>IOS, NX-OS aur ASA: live edit</h3>
<pre class="out">AUTO01$ python3 ch6a.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
PUN-CORE-R1(config)#interface Loopback10
PUN-CORE-R1(config-if)#description netmiko
PUN-CORE-R1(config-if)#ip address 10.10.10.10 255.255.255.255
PUN-CORE-R1(config-if)#bogus
                       ^
<span class="hl">% Invalid input detected at '^' marker.</span>
PUN-CORE-R1(config-if)#end
PUN-CORE-R1#</pre>
<p><code>send_config_set</code> poora config dialogue lautata hai. <code>bogus</code> line ki galti <b>return hoti hai, raise nahi</b>. Netmiko se raise karwane ke liye <code>error_pattern</code> do:</p>
<pre class="code">try:
    conn.send_config_set(["interface Loopback11", "bogus"], error_pattern=r"Invalid input")
except ConfigInvalidException as err:
    print("ConfigInvalidException:", str(err).splitlines()[0])
    print("still in config mode:", conn.check_config_mode())
    conn.exit_config_mode()                 <span class="c"># connection dobara use karne se pehle config mode chhodo</span>
print(conn.save_config())</pre>
<pre class="out">ConfigInvalidException: Invalid input detected at command: bogus, matched error: Invalid input
still in config mode: True
write mem
Building configuration...
[OK]
PUN-CORE-R1#</pre>
<p>NX-OS par wahi pattern <code>save_config()</code> ke saath khatam hota hai jo <code>copy running-config startup-config</code> chalata hai, aur device <code>Copy complete.</code> print karta hai.</p>

<h3>EOS: naam wala configuration session</h3>
<pre class="code">e.config_mode(config_command="configure session NKS")      <span class="c"># prompt: E1(config-session)#</span>
e.send_command_timing("interface Loopback6")
e.send_command_timing("ip address 10.6.6.6/32")
print(e.send_command_timing("show session-config diffs"))   <span class="c"># commit se pehle review</span>
print(e.send_command_timing("commit"))</pre>
<pre class="out">--- system:/running-config
+++ session:/NKS-session-config
@@ -13,6 +13,9 @@
    no switchport
    ip address 10.99.0.21/24
 !
<span class="hl">+interface Loopback6</span>
<span class="hl">+   ip address 10.6.6.6/32</span>
<span class="hl">+!</span>
 username netops privilege 15 secret sha512 $6$nk.....$...................................................................sU.................
 !
 end
Commit complete.
E1#</pre>
<p><code>commit</code> ki jagah <code>abort</code> do aur lab jawab deta hai <code>Session aborted; running configuration unchanged.</code>: session phenk di gayi aur kuch nahi badla.</p>

<h3>Junos: candidate, check, confirm, commit</h3>
<pre class="out">AUTO01$ python3 ch6c.py
configure
Entering configuration mode

[edit]
netops@J1#set system ntp server 10.99.0.1
netops@J1#
[edit system]
+   ntp {
+       server 10.99.0.1;
+   }

commit check
<span class="hl">configuration check succeeds</span>

[edit]
netops@J1#
commit confirmed 5 comment "add ntp"
commit confirmed will be automatically rolled back in 5 minutes unless confirmed
commit complete

# commit confirmed will be rolled back in 5 minutes

[edit]
netops@J1#
commit comment "confirmed"
commit complete</pre>
<p>Code mein yeh hai <code>conn.send_config_set(lines, exit_config_mode=False)</code>, phir <code>conn.commit(check=True)</code>, phir <code>conn.commit(comment="add ntp", confirm=True, confirm_delay=5, and_quit=False)</code> aur aakhir mein <code>conn.commit(comment="confirmed")</code>. <b>commit confirmed</b> box kho jaane par khud rollback ho jaata hai, remote router badalne ka sabse safe tareeka. Device commit reject kare to <code>commit()</code> <code>ValueError("Commit failed with the following errors: ...")</code> uthata hai. Do aur baatein: jis session ne <code>configure exclusive</code> chalaya woh database lock rakhta hai, aur doosre session ko <code>error: configuration database locked by:</code> milta hai jab tak pehla nikal na jaye; aur <code>save_config()</code> <code>NotImplementedError</code> deta hai kyunki commit khud save kar deta hai.</p>

<h3>FortiOS, PAN-OS aur ASA</h3>
<pre class="out">config system global
FGT1 (global) # set admintimeout 10
FGT1 (global) # end
FGT1 #
...
admin@PA1#commit
Commit job 3 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
<span class="hl">Configuration committed successfully</span></pre>
<p>FortiOS mein <code>configure</code> shabd nahi hota: aap asli block lines (<code>config system global</code>, <code>set ...</code>, <code>end</code>) jaisi hain waisi bhejte ho, aur har <code>end</code> badlaav apply karta hai. PAN-OS Junos ki tarah chalta hai: <code>set</code> lines, phir <code>commit()</code> aur success wala vakya. ASA IOS jaisa behave karta hai aur <code>write mem</code> se save hota hai.</p>

<h3>Sabke liye ek push function</h3>
<pre class="code">def push(conn, kind, lines):
    if kind in ("juniper_junos", "paloalto_panos"):
        out = conn.send_config_set(lines, exit_config_mode=False)
        out += conn.commit(comment="pushed by netmiko")
        conn.exit_config_mode()
    else:
        out = conn.send_config_set(lines)
        if kind != "fortinet":
            out += conn.save_config()
    return out</pre>
<pre class="out">cisco_ios       pushed 2 line(s), 9 lines of device output, prompt PUN-CORE-R1#
cisco_nxos      pushed 2 line(s), 10 lines of device output, prompt N1#
arista_eos      pushed 2 line(s), 8 lines of device output, prompt E1#
juniper_junos   pushed 1 line(s), 10 lines of device output, prompt netops@J1&gt;
fortinet        pushed 3 line(s), 4 lines of device output, prompt FGT1 #
paloalto_panos  pushed 1 line(s), 16 lines of device output, prompt admin@PA1&gt;
cisco_asa       pushed 1 line(s), 10 lines of device output, prompt ASA1#</pre>

<div class="warn"><p><b>Common mistakes.</b> Junos par default <code>exit_config_mode=True</code> ke saath <code>send_config_set</code> bulana: netmiko "Exit with uncommitted changes?" ka jawab "yes" deta hai aur aapka draft discard ho jaata hai. Junos ya FortiOS par <code>save_config()</code> bulana. <code>ConfigInvalidException</code> ke baad config mode chhode bina connection dobara use karna. Rollback plan ke bina router par push karna: <code>commit confirmed</code> use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Config accepted" ka matlab "config active" nahi. Junos aur PAN-OS par <code>commit</code> se pehle kuch live nahi; IOS-jaise boxes par live hai par <code>write memory</code> ya <code>copy running-config startup-config</code> tak saved nahi.</p></div>

<div class="scn"><h4>30 Junos routers par NTP "push", 0 badle</h4><p>Ek engineer ne IOS push script Juniper edge ke liye dobara use ki. Har run success print karta tha kyunki koi exception nahi aaya. Hafte baad monitoring ne clocks drift hote dikhaye. Script ne kabhi commit nahi kiya tha, aur netmiko ke default exit ne har draft discard kar diya.</p><p><b>Lesson:</b> result device se verify karo (<code>show configuration system ntp</code>), aur commit step ko Junos branch ka hissa banao.</p></div>

<div class="iv"><p class="q">"netmiko mein IOS aur Junos par config push mein kya farq hai?"</p><p>IOS lines <code>send_config_set</code> se leta hai aur woh turant live ho jaati hain; main <code>save_config</code> jodta hoon. Junos unhe candidate mein rakhta hai, isliye main <code>exit_config_mode=False</code> deta hoon, <code>commit()</code> (aksar confirm aur comment ke saath) bulata hoon, phir config mode chhodta hoon. Saboot ke liye main hamesha config wapas padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen models: live edit (IOS, NX-OS, ASA, FortiOS), candidate aur commit (Junos, PAN-OS), naam wala session (EOS).</li>
<li>Config errors text ki tarah return hote hain jab tak <code>error_pattern</code> na do; <code>ConfigInvalidException</code> ke baad config mode chhodo.</li>
<li>Junos: <code>exit_config_mode=False</code>, phir <code>commit()</code>; remote devices par <code>commit(confirm=True)</code> behtar.</li>
<li><code>save_config()</code> IOS, NX-OS, EOS aur ASA ke liye hai; Junos aur FortiOS par implemented nahi.</li>
<li>Configuration hamesha device se wapas padho.</li>
</ul></div>
`}};export{e as default};