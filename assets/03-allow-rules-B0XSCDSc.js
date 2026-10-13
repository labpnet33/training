var e=e=>`<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Anatomy of an allow rule">
<rect x="10" y="30" width="95" height="50" rx="8" fill="#bae6fd"/><text x="57" y="60" text-anchor="middle" class="svg-ink" font-size="13">allow</text>
<rect x="115" y="30" width="150" height="50" rx="8" fill="#fed7aa"/><text x="190" y="52" text-anchor="middle" class="svg-ink" font-size="12">from 10.99.0.0/24</text><text x="190" y="68" text-anchor="middle" class="svg-muted" font-size="10">who may connect</text>
<rect x="275" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="330" y="52" text-anchor="middle" class="svg-ink" font-size="12">to any</text><text x="330" y="68" text-anchor="middle" class="svg-muted" font-size="10">any server address</text>
<rect x="395" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="450" y="52" text-anchor="middle" class="svg-ink" font-size="12">port 22</text><text x="450" y="68" text-anchor="middle" class="svg-muted" font-size="10">which service</text>
<rect x="515" y="30" width="115" height="50" rx="8" fill="#fecaca"/><text x="572" y="52" text-anchor="middle" class="svg-ink" font-size="12">proto tcp</text><text x="572" y="68" text-anchor="middle" class="svg-muted" font-size="10">which protocol</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@nms03:~$ sudo ufw delete allow 23/tcp
netadmin@nms03:~$ sudo ufw allow ssh</pre>
<pre class="out">Rule deleted
Rule added</pre>`,n=`<pre class="code">netadmin@nms03:~$ sudo iptables -L -n</pre>
<pre class="out">Chain INPUT (policy DROP)
target     prot opt source               destination
ACCEPT     all  --  anywhere             anywhere             ctstate RELATED,ESTABLISHED
ACCEPT     icmp --  anywhere             anywhere             icmp echo-request
ACCEPT     tcp  --  <span class="hl">10.99.0.0/24</span>         anywhere             tcp dpt:<span class="hl">22</span>
ACCEPT     udp  --  10.99.0.0/24         anywhere             udp dpt:514
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:80

Chain FORWARD (policy DROP)
target     prot opt source               destination

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination</pre>`,r={id:`allow-rules`,h:{en:`Allow rules: who may reach which service`,hi:`Allow rules: kaun kis service tak pahunche`},body:{en:`
<p>With a default of deny, your whole job is writing <b>allow rules</b> that are as narrow as possible. A good rule answers four questions: <i>who</i> may connect, to <i>which address</i>, on <i>which port</i>, using <i>which protocol</i>. The long form of ufw maps exactly to those four questions.</p>
`+e(`Four questions, one rule. The more you answer, the narrower the rule.`)+`
<h3>The forms of an allow rule</h3>
<table class="cmp"><tr><th>Command</th><th>Meaning</th></tr>
<tr><td><code>ufw allow 80/tcp</code></td><td>Anyone may connect to TCP port 80.</td></tr>
<tr><td><code>ufw allow 80</code></td><td>Anyone, TCP and UDP port 80. Broader than usually needed.</td></tr>
<tr><td><code>ufw allow from 10.99.0.0/24 to any port 22 proto tcp</code></td><td>Only the management network may reach SSH.</td></tr>
<tr><td><code>ufw allow ssh</code></td><td>Same as 22/tcp from anywhere, using a service name.</td></tr>
<tr><td><code>ufw allow from 10.99.0.50</code></td><td>Everything from one trusted host. Use rarely.</td></tr></table>
<p>The pieces: <code>from</code> names the source, which can be one address or a network written in <b>CIDR</b> form (10.99.0.0/24 means all 254 usable addresses in that network). <code>to any</code> means any address of this server. <code>port</code> and <code>proto</code> select the service. Port 80 over <b>TCP</b> is a web page; port 514 over <b>UDP</b> is syslog. Writing the wrong protocol makes a perfectly valid rule that does nothing useful, a very common mistake.</p>
<p>A service name such as <code>ssh</code> is looked up in a small table in the system and turned into a port number. It is convenient, but note that <code>allow ssh</code> means from <b>Anywhere</b>. In a real network you usually want the longer form with a source network, so SSH is reachable only from management.</p>
<p>Deleting uses the same words as adding, with <code>delete</code> in front:</p>
`+t+`
<p>Each command answers with a short sentence: <code>Rule deleted</code> or <code>Rule added</code>. Always read it. If you meant to add a rule and you see <code>Skipping adding existing rule</code>, the rule is already there and nothing changed.</p>

<h3>What ufw really builds</h3>
<p>The rules you type are translated into kernel rules. You can see the translation with <code>iptables -L -n</code>: <code>-L</code> lists the rules, <code>-n</code> shows numbers instead of names, which is faster and clearer. This is the result of the three allow rules from chapter 2, after the firewall was enabled:</p>
`+n+`
<p>Read the chain <code>INPUT</code>, which is traffic coming to the server. Its <b>policy DROP</b> is the default deny. The first two rules are added by ufw for you: replies to connections the server itself started (<code>RELATED,ESTABLISHED</code>) and ping requests. Then come your three rules, in the order you typed them. Your <code>from 10.99.0.0/24 ... port 22 proto tcp</code> became <code>tcp 10.99.0.0/24 anywhere tcp dpt:22</code>. The <code>dpt</code> means destination port. <code>FORWARD</code> has policy DROP too: this server will not route traffic for others. <code>OUTPUT</code> has policy ACCEPT: the server may start connections.</p>

<div class="eg"><p><b>Worked example.</b> Translate this request into one rule: "The Network Operations team on 10.99.0.0/24 needs to send SNMP traps to this server." SNMP traps arrive on UDP port 162. Source: the team network. Rule: <code>ufw allow from 10.99.0.0/24 to any port 162 proto udp</code>. Four questions answered: who (10.99.0.0/24), which address (any), which port (162), which protocol (udp).</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Writing <code>allow 80</code> when only TCP is needed; using <code>allow from Anywhere</code> for management services; forgetting that a service name opens the port for everyone; mixing up the source and destination ports. In <code>to any port 22</code> the port is the server side.</p></div>
<div class="exam"><p><b>Exam trap.</b> The word <code>port</code> in a ufw rule is the <b>destination</b> port on the server, not the client's random source port.</p></div>
<div class="scn"><h4>The rule that did nothing</h4><p>An engineer wrote <code>allow 514/tcp</code> to open syslog, yet the router's messages never arrived. Classic syslog uses UDP. The firewall log showed the router's packets blocked with PROTO=UDP and DPT=514. One corrected rule, <code>allow from 10.99.0.0/24 to any port 514 proto udp</code>, fixed it.</p><p><b>Lesson:</b> a rule has a protocol. Match the service.</p></div>
<div class="iv"><p class="q">"How would you let only the management network SSH to a server?"</p><p><code>ufw allow from 10.99.0.0/24 to any port 22 proto tcp</code>, with default deny incoming. I would then test from a management host and from a host outside it, and confirm that the second one cannot connect.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule has four parts: source, destination address, port and protocol.</li>
<li>Prefer the long form with a source network over service names or bare ports.</li>
<li>Read the reply: Rule added, Rule deleted, or Skipping adding existing rule.</li>
<li><code>iptables -L -n</code> shows what ufw built in the kernel.</li>
</ul></div>
`,hi:`
<p>Default deny ke saath aapka poora kaam <b>allow rules</b> likhna hai jo jitne ho sake utne narrow hon. Achha rule chaar sawaalon ka jawab deta hai: <i>kaun</i> connect kare, kis <i>address</i> par, kis <i>port</i> par, kaunse <i>protocol</i> se. ufw ka lamba form bilkul in chaar sawaalon se mel khata hai.</p>
`+e(`Chaar sawaal, ek rule. Jitne zyada jawab, utna narrow rule.`)+`
<h3>Allow rule ke forms</h3>
<table class="cmp"><tr><th>Command</th><th>Matlab</th></tr>
<tr><td><code>ufw allow 80/tcp</code></td><td>Koi bhi TCP port 80 par connect kar sakta hai.</td></tr>
<tr><td><code>ufw allow 80</code></td><td>Koi bhi, TCP aur UDP port 80. Aam zaroorat se zyada broad.</td></tr>
<tr><td><code>ufw allow from 10.99.0.0/24 to any port 22 proto tcp</code></td><td>Sirf management network SSH tak pahunche.</td></tr>
<tr><td><code>ufw allow ssh</code></td><td>Service naam se, anywhere se 22/tcp ke barabar.</td></tr>
<tr><td><code>ufw allow from 10.99.0.50</code></td><td>Ek bharose-mand host se sab kuch. Kam use karo.</td></tr></table>
<p>Hisse: <code>from</code> source batata hai, jo ek address ya <b>CIDR</b> form ka network ho sakta hai (10.99.0.0/24 matlab us network ke saare 254 usable addresses). <code>to any</code> matlab is server ka koi bhi address. <code>port</code> aur <code>proto</code> service chunte hain. <b>TCP</b> par port 80 web page hai; <b>UDP</b> par port 514 syslog hai. Galat protocol likhne se bilkul valid rule banta hai jo kaam ka nahi, bahut aam galti.</p>
<p><code>ssh</code> jaisa service naam system ki chhoti table mein dhoondha jaata hai aur port number ban jaata hai. Yeh suvidhajanak hai, par dhyan rahe ki <code>allow ssh</code> ka matlab <b>Anywhere</b> se hai. Asli network mein aap aam taur par source network ke saath lamba form chahte ho, taaki SSH sirf management se pahunche.</p>
<p>Delete wahi shabd use karta hai jo add, aage <code>delete</code> lagakar:</p>
`+t+`
<p>Har command ek chhota vaakya jawab deta hai: <code>Rule deleted</code> ya <code>Rule added</code>. Hamesha padho. Agar rule jodna chaha aur <code>Skipping adding existing rule</code> dikhe, to rule pehle se hai aur kuch nahi badla.</p>

<h3>ufw asal mein kya banata hai</h3>
<p>Aapke type kiye rules kernel rules mein translate hote hain. Translation <code>iptables -L -n</code> se dikhta hai: <code>-L</code> rules list karta hai, <code>-n</code> naam ki jagah numbers dikhata hai, jo tez aur saaf hai. Yeh chapter 2 ke teen allow rules ka result hai, firewall enable hone ke baad:</p>
`+n+`
<p>Chain <code>INPUT</code> padho, jo server ki taraf aata traffic hai. Uski <b>policy DROP</b> default deny hai. Pehle do rules ufw aapke liye jodta hai: server ke apne shuru kiye connections ke replies (<code>RELATED,ESTABLISHED</code>) aur ping requests. Phir aapke teen rules, usi order mein jisme type kiye. Aapka <code>from 10.99.0.0/24 ... port 22 proto tcp</code> <code>tcp 10.99.0.0/24 anywhere tcp dpt:22</code> ban gaya. <code>dpt</code> matlab destination port. <code>FORWARD</code> ki policy bhi DROP hai: yeh server doosron ka traffic route nahi karega. <code>OUTPUT</code> ki policy ACCEPT hai: server connections shuru kar sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> Is request ko ek rule mein badlo: "10.99.0.0/24 par Network Operations team ko is server par SNMP traps bhejne hain." SNMP traps UDP port 162 par aate hain. Source: team ka network. Rule: <code>ufw allow from 10.99.0.0/24 to any port 162 proto udp</code>. Chaar sawaalon ke jawab: kaun (10.99.0.0/24), kaunsa address (any), kaunsa port (162), kaunsa protocol (udp).</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Sirf TCP chahiye aur <code>allow 80</code> likhna; management services ke liye <code>allow from Anywhere</code> use karna; yeh bhoolna ki service naam port sabke liye kholta hai; source aur destination ports ko ulajhana. <code>to any port 22</code> mein port server ki taraf ka hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> ufw rule mein <code>port</code> shabd server ka <b>destination</b> port hai, client ka random source port nahi.</p></div>
<div class="scn"><h4>Woh rule jo kuch nahi karta tha</h4><p>Ek engineer ne syslog kholne ke liye <code>allow 514/tcp</code> likha, phir bhi router ke messages nahi aaye. Classic syslog UDP use karta hai. Firewall log mein router ke packets PROTO=UDP aur DPT=514 ke saath block dikhe. Ek sudhra hua rule, <code>allow from 10.99.0.0/24 to any port 514 proto udp</code>, ne theek kar diya.</p><p><b>Lesson:</b> rule ka protocol hota hai. Service se match karo.</p></div>
<div class="iv"><p class="q">"Sirf management network ko server par SSH kaise doge?"</p><p><code>ufw allow from 10.99.0.0/24 to any port 22 proto tcp</code>, default deny incoming ke saath. Phir management host se aur uske bahar ke host se test karunga, aur confirm karunga ki doosra connect nahi kar sakta.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule ke chaar hisse: source, destination address, port aur protocol.</li>
<li>Service naam ya bare ports ki jagah source network wala lamba form pasand karo.</li>
<li>Reply padho: Rule added, Rule deleted ya Skipping adding existing rule.</li>
<li><code>iptables -L -n</code> dikhata hai ufw ne kernel mein kya banaya.</li>
</ul></div>
`}};export{r as default};