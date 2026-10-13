var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Transfer failure decision path">
<rect x="10" y="60" width="120" height="50" rx="8" fill="#bae6fd"/><text x="70" y="82" text-anchor="middle" class="svg-ink" font-size="12">Router error</text><text x="70" y="98" text-anchor="middle" class="svg-muted" font-size="11">copy fails</text>
<rect x="165" y="10" width="200" height="40" rx="8" fill="#fde68a"/><text x="265" y="35" text-anchor="middle" class="svg-ink" font-size="12">timeout: reach, firewall, service</text>
<rect x="165" y="65" width="200" height="40" rx="8" fill="#fed7aa"/><text x="265" y="90" text-anchor="middle" class="svg-ink" font-size="12">No such file: name, --create, dir</text>
<rect x="165" y="120" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="265" y="145" text-anchor="middle" class="svg-ink" font-size="12">Permission denied: owner, mode</text>
<rect x="410" y="60" width="220" height="50" rx="8" fill="#bbf7d0"/><text x="520" y="82" text-anchor="middle" class="svg-ink" font-size="12">server journal tells which one</text><text x="520" y="98" text-anchor="middle" class="svg-muted" font-size="11">journalctl -u tftpd-hpa</text>
<line x1="130" y1="85" x2="165" y2="30" stroke="#64748b" stroke-width="2"/><line x1="130" y1="85" x2="165" y2="85" stroke="#64748b" stroke-width="2"/><line x1="130" y1="85" x2="165" y2="140" stroke="#64748b" stroke-width="2"/><line x1="365" y1="85" x2="410" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@tftp01:~$ sudo ufw allow ssh
netadmin@tftp01:~$ sudo ufw allow from 10.99.0.0/24 to any port 69 proto udp
netadmin@tftp01:~$ sudo ufw enable
<span class="c">(ufw asks for confirmation: answer y)</span>
netadmin@tftp01:~$ sudo ufw status numbered</pre>
<pre class="out">Rule added
Rule added
Firewall is active and enabled on system startup
Status: active

     To                         Action      From
     --                         ------      ----
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] <span class="hl">69/udp                     ALLOW IN    10.99.0.0/24</span></pre>`,n=`<pre class="code"><span class="c"># the five-command health check on the server</span>
systemctl status tftpd-hpa
ss -uln
cat /etc/default/tftpd-hpa
ls -l /srv/tftp
sudo journalctl -u tftpd-hpa -n 5</pre>`,r={id:`lockdown-troubleshooting`,h:{en:`Locking the server down and troubleshooting transfers`,hi:`Server ko lock karna aur transfers troubleshoot karna`},body:{en:`
<p>This chapter does two jobs. First you protect the TFTP server so that only your management network can talk to it. Then you turn the three errors you met into one reusable troubleshooting method. The firewall command is <code>ufw</code>; the next module teaches it in depth, so here you use only the lines you need.</p>

<h3>Part 1: firewall the TFTP server</h3>
<p>TFTP has no password, so the <b>network</b> must provide the access control. The rule of least privilege: allow exactly the traffic you need, from exactly the sources that need it, and deny the rest. Here that means two allows: SSH (so you can still administer the server) and UDP 69 from the management network only.</p>
`+t+`
<p>Study the order. The SSH rule comes <b>before</b> <code>enable</code>. If you enabled the firewall first with a default of deny, your own SSH session could be cut off and you would be locked out. The question "Command may disrupt existing ssh connections" is ufw's warning; with SSH already allowed it is safe to answer y. The status shows two allow rules and, since the default for incoming traffic is deny, everything else is dropped. The line to read is rule 2: <b>69/udp from 10.99.0.0/24</b>. A laptop on another network now gets no answer from the TFTP service at all.</p>
<p>Notice also what you did not do: you did not open UDP 69 to "Anywhere". If a customer network or the internet can reach a TFTP server, anybody can download your configurations.</p>
`+e(`Three router errors map to three families of causes. The server journal tells you which family.`)+`

<h3>Part 2: the troubleshooting method</h3>
<p>When a copy fails, resist the urge to try random changes. Read the message on the router, then ask the server what it saw. Use this table:</p>
<table class="cmp"><tr><th>Router shows</th><th>Server journal shows</th><th>Meaning</th><th>Fix</th></tr>
<tr><td>Timeout, nothing happens</td><td>No request at all</td><td>The request never arrived: no route, wrong address, firewall, service down</td><td>Ping the server, <code>ss -uln</code>, <code>ufw status</code>, <code>ufw.log</code></td></tr>
<tr><td>No such file or directory</td><td>WRQ or RRQ, then <code>NAK (1, File not found)</code></td><td>Wrong name or folder, or no <code>--create</code> for a new upload</td><td>Check spelling and case, <code>TFTP_DIRECTORY</code>, add <code>--create</code></td></tr>
<tr><td>Permission denied</td><td>RRQ or WRQ, then <code>NAK (0, Permission denied)</code></td><td>The tftp user lacks read or write permission</td><td><code>ls -l</code>, then <code>chmod 644</code> or <code>chown tftp:tftp</code></td></tr></table>
<p>The first row deserves care. A timeout produces <b>no journal line</b>, because the daemon never heard the request. That absence is the evidence. If the router can ping the server but TFTP still times out, suspect the firewall: a blocked packet appears in <code>/var/log/ufw.log</code> as a <code>[UFW BLOCK]</code> line with <code>DPT=69</code>. A router whose management address is outside 10.99.0.0/24 will be blocked by the rule above, which is the design working as intended; fix the source address or add one specific rule.</p>

<h3>The five-command health check</h3>
`+n+`
<p>Run them in this order. <b>Status</b> answers "is the daemon alive?". <b>ss</b> answers "is it listening on 69?". The <b>settings file</b> answers "which folder and which options?". <b>ls -l</b> answers "is the file there, with what owner and mode?". The <b>journal</b> answers "what did the last requests ask and how did the server reply?". In under two minutes you cover every cause in the table.</p>

<h3>The P1 ticket as a method</h3>
<p>For NK-2466 the steps were: (1) the router said Permission denied, so the request arrived; (2) the journal showed an RRQ and a NAK code 0; (3) <code>ls -l</code> showed mode 600 owned by root; (4) <code>grep USERNAME /etc/default/tftpd-hpa</code> showed the daemon runs as tftp; (5) <code>chmod 644</code> fixed it; (6) the restore worked, and the configuration was verified and saved. Six small steps, each backed by evidence.</p>

<div class="eg"><p><b>Worked example.</b> A new router at 10.99.1.5 (a different subnet) cannot back up. It times out. Journal: nothing new. <code>ss -uln</code>: port 69 open. <code>ufw status</code>: UDP 69 allowed only from 10.99.0.0/24. Conclusion: the firewall is correctly dropping an address outside the allowed network. The decision belongs to a human: either move the router to the management range or add a narrow rule <code>allow from 10.99.1.5 to any port 69 proto udp</code>. Never "allow from anywhere".</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Enabling ufw before allowing SSH; allowing UDP 69 from anywhere; disabling the firewall to test; reading a timeout as a permission problem. Remember: errors with a text come from the server, silence comes from the path.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order matters when you build a firewall on a remote machine: allow management access first, then enable. And "default deny incoming" is what turns your two allow rules into a complete policy.</p></div>

<div class="scn"><h4>The restore that waited 60 seconds</h4><p>During a real outage a restore attempt hung and then failed with a timeout. The engineer, under pressure, started changing file permissions. The journal had no entries, which showed that the request never arrived. The cause was a firewall rule on the new core switch that blocked UDP 69 between the management VLAN and the server. A temporary specific allow rule restored service; the permanent fix went through change control.</p><p><b>Lesson:</b> no journal entry means look at the path, not the files.</p></div>

<div class="iv"><p class="q">"A router cannot copy a config to your TFTP server. Walk me through it."</p><p>Read the router error. If it is a timeout, the request did not arrive: check reachability, the firewall rule for UDP 69 and the ufw log, and that the daemon listens. If it says no such file, check the name, directory and the create option. If permission denied, check owner and mode against the daemon user. Confirm each with the tftpd-hpa journal, fix the smallest thing, and retest.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Allow SSH first, then UDP 69 only from the management network, then enable ufw; default incoming is deny.</li>
<li>Timeout and no journal entry: the path (reachability, firewall, service).</li>
<li>No such file: name, directory or <code>--create</code>. Permission denied: owner and mode.</li>
<li>The server journal separates the families of causes.</li>
<li>Use the five-command health check and fix the smallest thing.</li>
</ul></div>
`,hi:`
<p>Is chapter mein do kaam hain. Pehle aap TFTP server ko protect karte ho taaki sirf aapka management network usse baat kar sake. Phir un teen errors ko aap ek reusable troubleshooting method mein badalte ho jinse aap mile. Firewall command <code>ufw</code> hai; agla module use gehrai se sikhata hai, isliye yahan sirf zaroori lines use karte hain.</p>

<h3>Part 1: TFTP server ko firewall karo</h3>
<p>TFTP ka password nahi hota, isliye access control <b>network</b> ko dena hota hai. Least privilege ka rule: bilkul wahi traffic allow karo jo chahiye, bilkul un sources se jinhe chahiye, aur baaki deny. Yahan matlab do allows: SSH (taaki aap server administer kar sako) aur UDP 69 sirf management network se.</p>
`+t+`
<p>Order dhyan se dekho. SSH rule <code>enable</code> se <b>pehle</b> aata hai. Agar aap default deny ke saath pehle firewall enable karte, to aapka apna SSH session kat sakta tha aur aap bahar ho jaate. Sawaal "Command may disrupt existing ssh connections" ufw ki warning hai; SSH pehle se allowed ho to y bolna surakshit hai. Status do allow rules dikhata hai aur, kyunki incoming ka default deny hai, baaki sab drop hota hai. Padhne wali line rule 2 hai: <b>69/udp from 10.99.0.0/24</b>. Doosre network ke laptop ko ab TFTP service se koi jawab hi nahi milta.</p>
<p>Yeh bhi dekho ki aapne kya nahi kiya: aapne UDP 69 ko "Anywhere" ke liye nahi khola. Agar customer network ya internet TFTP server tak pahunch sake, to koi bhi aapki configurations download kar sakta hai.</p>
`+e(`Teen router errors teen kism ke kaaranon se mapped hain. Server journal batata hai kaunsa.`)+`

<h3>Part 2: troubleshooting method</h3>
<p>Copy fail ho to random changes karne ki ichha ko rokiye. Router ka message padho, phir server se poochho usne kya dekha. Yeh table use karo:</p>
<table class="cmp"><tr><th>Router dikhata hai</th><th>Server journal dikhata hai</th><th>Matlab</th><th>Fix</th></tr>
<tr><td>Timeout, kuch nahi hota</td><td>Koi request nahi</td><td>Request pahunchi hi nahi: route nahi, galat address, firewall, service down</td><td>Server ko ping, <code>ss -uln</code>, <code>ufw status</code>, <code>ufw.log</code></td></tr>
<tr><td>No such file or directory</td><td>WRQ ya RRQ, phir <code>NAK (1, File not found)</code></td><td>Galat naam ya folder, ya nayi upload ke liye <code>--create</code> nahi</td><td>Spelling aur case, <code>TFTP_DIRECTORY</code> check karo, <code>--create</code> jodo</td></tr>
<tr><td>Permission denied</td><td>RRQ ya WRQ, phir <code>NAK (0, Permission denied)</code></td><td>tftp user ke paas read ya write permission nahi</td><td><code>ls -l</code>, phir <code>chmod 644</code> ya <code>chown tftp:tftp</code></td></tr></table>
<p>Pehli row par dhyan do. Timeout <b>koi journal line nahi</b> banata, kyunki daemon ne request suni hi nahi. Woh gair-maujoodgi hi saboot hai. Agar router server ko ping kar sakta hai par TFTP phir bhi timeout hota hai, to firewall par shak karo: blocked packet <code>/var/log/ufw.log</code> mein <code>DPT=69</code> wali <code>[UFW BLOCK]</code> line ki tarah dikhta hai. Jis router ka management address 10.99.0.0/24 ke bahar hai woh upar ke rule se block hoga, jo design ka sahi kaam karna hai; source address theek karo ya ek specific rule jodo.</p>

<h3>Paanch-command health check</h3>
`+n+`
<p>Inhe is order mein chalao. <b>Status</b> jawab deta hai "daemon zinda hai?". <b>ss</b> jawab deta hai "kya woh 69 par sun raha hai?". <b>Settings file</b> jawab deti hai "kaunsa folder aur kaunse options?". <b>ls -l</b> jawab deta hai "file wahan hai, kis owner aur mode ke saath?". <b>Journal</b> jawab deta hai "aakhri requests ne kya maanga aur server ne kaise jawab diya?". Do minute se kam mein aap table ke har kaaran ko cover kar lete ho.</p>

<h3>P1 ticket ek method ki tarah</h3>
<p>NK-2466 ke liye steps the: (1) router ne Permission denied kaha, matlab request pahunchi; (2) journal ne RRQ aur NAK code 0 dikhaya; (3) <code>ls -l</code> ne root ki mode 600 dikhayi; (4) <code>grep USERNAME /etc/default/tftpd-hpa</code> ne dikhaya ki daemon tftp ki tarah chalta hai; (5) <code>chmod 644</code> ne theek kiya; (6) restore chala, aur configuration verify aur save hui. Chhe chhote steps, har ek ke peeche saboot.</p>

<div class="eg"><p><b>Worked example.</b> Naya router 10.99.1.5 par (alag subnet) backup nahi le pa raha. Timeout aata hai. Journal: kuch naya nahi. <code>ss -uln</code>: port 69 khula. <code>ufw status</code>: UDP 69 sirf 10.99.0.0/24 se allowed. Nishkarsh: firewall sahi tarah allowed network ke bahar ke address ko drop kar raha hai. Faisla insaan ka hai: ya router ko management range mein lao ya ek narrow rule <code>allow from 10.99.1.5 to any port 69 proto udp</code> jodo. Kabhi "allow from anywhere" nahi.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> SSH allow kiye bina ufw enable karna; UDP 69 ko anywhere se allow karna; test ke liye firewall band karna; timeout ko permission problem padhna. Yaad rakho: text wale errors server se aate hain, khamoshi path se aati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remote machine par firewall banate waqt order matter karta hai: pehle management access allow karo, phir enable. Aur "default deny incoming" hi aapke do allow rules ko poori policy banata hai.</p></div>

<div class="scn"><h4>Restore jo 60 second intezaar karta raha</h4><p>Asli outage ke dauraan ek restore attempt latak gaya aur timeout se fail hua. Pressure mein engineer ne file permissions badalna shuru kar diya. Journal mein koi entries nahi thi, jisse dikha ki request kabhi pahunchi hi nahi. Kaaran naye core switch par firewall rule tha jo management VLAN aur server ke beech UDP 69 block karta tha. Temporary specific allow rule ne service wapas layi; permanent fix change control se guzra.</p><p><b>Lesson:</b> journal entry nahi matlab path dekho, files nahi.</p></div>

<div class="iv"><p class="q">"Router aapke TFTP server par config copy nahi kar pa raha. Mujhe step by step batao."</p><p>Router ka error padho. Timeout ho to request pahunchi nahi: reachability, UDP 69 ka firewall rule aur ufw log, aur daemon sun raha hai yeh check karo. No such file ho to naam, directory aur create option dekho. Permission denied ho to daemon user ke hisaab se owner aur mode dekho. Har cheez tftpd-hpa journal se confirm karo, sabse chhoti cheez theek karo, aur retest karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle SSH allow karo, phir UDP 69 sirf management network se, phir ufw enable; incoming default deny hai.</li>
<li>Timeout aur journal entry nahi: path (reachability, firewall, service).</li>
<li>No such file: naam, directory ya <code>--create</code>. Permission denied: owner aur mode.</li>
<li>Server journal kaaranon ke families ko alag karta hai.</li>
<li>Paanch-command health check use karo aur sabse chhoti cheez theek karo.</li>
</ul></div>
`}};export{r as default};