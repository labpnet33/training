var e={id:`pushing-config`,h:{en:`Pushing configuration to many routers`,hi:`Kai routers par configuration push karna`},body:{en:`
<p>So far your scripts only <b>read</b>. Now you will <b>change</b> something. A change needs a different tool from <code>send_command</code>, because configuration commands must be typed in configuration mode. The method is <code>send_config_set()</code>. It does by itself what you do by hand: <code>configure terminal</code>, your lines, then <code>end</code>.</p>
<h3>One router first</h3>
<p>Always try a change on a single device first. This script sends one line, <code>ntp server 10.99.0.200</code>, to R1 and prints what the method returns. The return value is the "screen" of the configuration session:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
result = conn.send_config_set(["ntp server 10.99.0.200"])
print(result)
print(conn.save_config())
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 ntp_one.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
<span class="hl">KF-DEL-R1(config)#ntp server 10.99.0.200</span>
KF-DEL-R1(config)#end
KF-DEL-R1#
write mem
Building configuration...
<span class="hl">[OK]</span>
KF-DEL-R1#</pre>
<ul>
<li>The argument is a <b>list</b> of config lines, even for one line. A list lets you send ten lines the same way.</li>
<li>The returned text shows the prompt changing to <code>(config)#</code>, the line being accepted, and <code>end</code>. No error text means the router accepted the line.</li>
<li><code>save_config()</code> is the same as <code>write memory</code>. A change that is not saved is lost at the next reload.</li>
</ul>
<h3>Now all five routers</h3>
<p>Lab 2 gives you <code>ntp_push.py</code>. It is the same loop you know, with the config step inside:</p>
<pre class="code"><span class="c"># ntp_push.py - send the same NTP setting to every router</span>
from nkmiko import ConnectHandler

<span class="c"># the company time server (NTP = Network Time Protocol)</span>
NTP_SERVER = "10.99.0.200"

<span class="c"># the routers to change - one management IP per router</span>
ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.40", "10.99.0.5"]

<span class="c"># the config lines to send: the same list for every router</span>
CONFIG = ["ntp server " + NTP_SERVER]

changed = 0    <span class="c"># a counter that starts at zero</span>
for ip in ROUTERS:
    print("Working on", ip)
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    conn.send_config_set(CONFIG)   <span class="c"># conf t, send the lines, end</span>
    conn.save_config()             <span class="c"># same as: write memory</span>
    conn.disconnect()
    changed = changed + 1
    print("  NTP set, config saved")

print("Routers changed:", changed)</pre>
<p>Three new ideas. <code>NTP_SERVER</code> is a variable used inside a bigger string: <code>"ntp server " + NTP_SERVER</code> joins two pieces of text with <code>+</code>. <code>CONFIG</code> is a list of lines, ready to grow. <code>changed</code> is a counter that goes up by one after each successful router.</p>
<p>After the router list typo is fixed (chapter 7 shows how you find it), this is the real run:</p>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
Working on 10.99.0.4
  NTP set, config saved
Working on 10.99.0.5
  NTP set, config saved
<span class="hl">Routers changed: 5</span></pre>
<h3>Do not trust only the script</h3>
<p>A script printing "NTP set" proves that your code ran. It does not prove the router holds the line. Log in to one router that you did not look at before, R4, and check its running configuration:</p>
<pre class="out">KF-KOL-R4# show running-config | include ntp
<span class="hl">ntp server 10.99.0.200</span></pre>
<div class="eg"><p><b>Worked example.</b> To also set a timezone, you would not write new login code. You only grow the list: <code>CONFIG = ["ntp server " + NTP_SERVER, "clock timezone IST 5 30"]</code>. The same loop now sends two lines to every router.</p></div>
<div class="warn"><p><b>Common mistake.</b> Sending a configuration line with <code>send_command</code>. It tries to run it in the wrong mode and fails. Use <code>send_config_set</code> for config, <code>send_command</code> for show. Also do not forget <code>save_config()</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> enters and leaves configuration mode for you and takes a list of strings. <code>save_config</code> saves the running configuration to the startup configuration.</p></div>
<div class="scn"><h4>The NTP rollout</h4><p>Kaveri Foods bought a time server so all five branch routers would log events with the same time. One engineer scripted the change for the five routers. The script ran in under a minute and printed "Routers changed: 5". He then logged in to one router, ran the include check, and attached that output to the change ticket as proof.</p><p><b>Lesson:</b> the script does the work, and an independent check from the router proves it.</p></div>
<div class="iv"><p class="q">"How do you push configuration to many devices with a script?"</p><p>Keep the device list and the config lines as data, loop over the devices, open a session, send the lines with the config method (<code>send_config_set</code> in netmiko), save, disconnect, and print a result per device. Test on one device first and verify afterwards on the device itself.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>send_config_set takes a list of lines and handles configuration mode for you.</li>
<li>save_config() is write memory.</li>
<li>Try one device first, then loop over all.</li>
<li>Verify on a router; do not trust only the script's own message.</li>
</ul></div>
`,hi:`
<p>Ab tak aapke scripts sirf <b>padhte</b> the. Ab aap kuch <b>badaloge</b>. Change ke liye <code>send_command</code> se alag tool chahiye, kyunki configuration commands configuration mode mein type hote hain. Method hai <code>send_config_set()</code>. Yeh khud wahi karta hai jo aap haath se karte ho: <code>configure terminal</code>, aapki lines, phir <code>end</code>.</p>
<h3>Pehle ek router</h3>
<p>Change ko hamesha pehle ek device par try karo. Yeh script R1 ko ek line, <code>ntp server 10.99.0.200</code>, bhejta hai aur method jo return karta hai woh print karta hai. Return value configuration session ki "screen" hai:</p>
<pre class="code">from nkmiko import ConnectHandler

conn = ConnectHandler(device_type="nk_ios", host="10.99.0.1", username="netops", password="NK@2026")
result = conn.send_config_set(["ntp server 10.99.0.200"])
print(result)
print(conn.save_config())
conn.disconnect()</pre>
<pre class="out">AUTO&gt; python3 ntp_one.py
configure terminal
Enter configuration commands, one per line.  End with CNTL/Z.
<span class="hl">KF-DEL-R1(config)#ntp server 10.99.0.200</span>
KF-DEL-R1(config)#end
KF-DEL-R1#
write mem
Building configuration...
<span class="hl">[OK]</span>
KF-DEL-R1#</pre>
<ul>
<li>Argument config lines ki ek <b>list</b> hai, ek line ho tab bhi. List se aap das lines bhi isi tarah bhej sakte ho.</li>
<li>Return hua text prompt ka <code>(config)#</code> mein badalna, line ka accept hona, aur <code>end</code> dikhata hai. Koi error text nahi matlab router ne line accept kar li.</li>
<li><code>save_config()</code> <code>write memory</code> ke barabar hai. Jo change save nahi hua woh agle reload par chala jaata hai.</li>
</ul>
<h3>Ab paanchon routers</h3>
<p>Lab 2 aapko <code>ntp_push.py</code> deta hai. Yeh wahi loop hai jo aap jaante ho, bas config step andar hai:</p>
<pre class="code"><span class="c"># ntp_push.py - send the same NTP setting to every router</span>
from nkmiko import ConnectHandler

<span class="c"># the company time server (NTP = Network Time Protocol)</span>
NTP_SERVER = "10.99.0.200"

<span class="c"># the routers to change - one management IP per router</span>
ROUTERS = ["10.99.0.1", "10.99.0.2", "10.99.0.3", "10.99.0.40", "10.99.0.5"]

<span class="c"># the config lines to send: the same list for every router</span>
CONFIG = ["ntp server " + NTP_SERVER]

changed = 0    <span class="c"># a counter that starts at zero</span>
for ip in ROUTERS:
    print("Working on", ip)
    conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
    conn.send_config_set(CONFIG)   <span class="c"># conf t, send the lines, end</span>
    conn.save_config()             <span class="c"># same as: write memory</span>
    conn.disconnect()
    changed = changed + 1
    print("  NTP set, config saved")

print("Routers changed:", changed)</pre>
<p>Teen naye ideas. <code>NTP_SERVER</code> ek variable hai jo bade string ke andar use hota hai: <code>"ntp server " + NTP_SERVER</code> do text ko <code>+</code> se jodta hai. <code>CONFIG</code> lines ki list hai, badhne ke liye taiyaar. <code>changed</code> ek counter hai jo har kamyab router ke baad ek badhta hai.</p>
<p>Router list ka typo fix hone ke baad (chapter 7 dikhata hai ise kaise dhoondhte hain), yeh asli run hai:</p>
<pre class="out">AUTO&gt; python3 ntp_push.py
Working on 10.99.0.1
  NTP set, config saved
Working on 10.99.0.2
  NTP set, config saved
Working on 10.99.0.3
  NTP set, config saved
Working on 10.99.0.4
  NTP set, config saved
Working on 10.99.0.5
  NTP set, config saved
<span class="hl">Routers changed: 5</span></pre>
<h3>Sirf script par bharosa mat karo</h3>
<p>Script ka "NTP set" print karna sirf yeh saabit karta hai ki aapka code chala. Yeh saabit nahi karta ki router ke paas line hai. Ek aise router par login karo jise pehle nahi dekha, R4, aur uski running configuration check karo:</p>
<pre class="out">KF-KOL-R4# show running-config | include ntp
<span class="hl">ntp server 10.99.0.200</span></pre>
<div class="eg"><p><b>Worked example.</b> Timezone bhi set karna ho to naya login code nahi likhoge. Bas list badhao: <code>CONFIG = ["ntp server " + NTP_SERVER, "clock timezone IST 5 30"]</code>. Wahi loop ab har router ko do lines bhejta hai.</p></div>
<div class="warn"><p><b>Common galti.</b> Configuration line ko <code>send_command</code> se bhejna. Yeh use galat mode mein chalane ki koshish karta hai aur fail hota hai. Config ke liye <code>send_config_set</code>, show ke liye <code>send_command</code>. <code>save_config()</code> bhoolna bhi mat.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> aapke liye configuration mode mein jaata aur nikalta hai aur strings ki list leta hai. <code>save_config</code> running configuration ko startup configuration mein save karta hai.</p></div>
<div class="scn"><h4>NTP rollout</h4><p>Kaveri Foods ne time server kharida taaki paanchon branch routers events ek hi time ke saath log karein. Ek engineer ne paanch routers ke liye change script kiya. Script ek minute se kam mein chala aur "Routers changed: 5" print kiya. Phir usne ek router par login karke include check chalaya, aur wo output change ticket mein saboot ke taur par lagaya.</p><p><b>Lesson:</b> kaam script karta hai, aur router se alag check use saabit karta hai.</p></div>
<div class="iv"><p class="q">"Script se kai devices par configuration kaise push karte ho?"</p><p>Device list aur config lines ko data ki tarah rakho, devices par loop chalao, session kholo, config method se lines bhejo (netmiko mein <code>send_config_set</code>), save karo, disconnect karo, aur har device ka result print karo. Pehle ek device par test karo aur baad mein device par hi verify karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>send_config_set lines ki list leta hai aur configuration mode khud sambhalta hai.</li>
<li>save_config() matlab write memory.</li>
<li>Pehle ek device try karo, phir sab par loop.</li>
<li>Router par verify karo; sirf script ke apne message par bharosa mat karo.</li>
</ul></div>
`}};export{e as default};