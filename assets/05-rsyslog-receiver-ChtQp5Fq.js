var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="rsyslog receive pipeline">
<rect x="10" y="40" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="68" text-anchor="middle" class="svg-ink" font-size="13">UDP 514</text><text x="70" y="86" text-anchor="middle" class="svg-muted" font-size="11">imudp input</text>
<rect x="175" y="40" width="130" height="60" rx="10" fill="#fde68a"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">Rule</text><text x="240" y="86" text-anchor="middle" class="svg-muted" font-size="11">not from 127.0.0.1?</text>
<rect x="350" y="40" width="130" height="60" rx="10" fill="#ddd6fe"/><text x="415" y="68" text-anchor="middle" class="svg-ink" font-size="13">Template</text><text x="415" y="86" text-anchor="middle" class="svg-muted" font-size="11">file name from IP</text>
<rect x="525" y="40" width="105" height="60" rx="10" fill="#bbf7d0"/><text x="577" y="68" text-anchor="middle" class="svg-ink" font-size="13">File</text><text x="577" y="86" text-anchor="middle" class="svg-muted" font-size="11">10.99.0.1.log</text>
<line x1="130" y1="70" x2="175" y2="70" stroke="#64748b" stroke-width="2"/><line x1="305" y1="70" x2="350" y2="70" stroke="#64748b" stroke-width="2"/><line x1="480" y1="70" x2="525" y2="70" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">then "stop": do not also write the message to /var/log/syslog</text>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@syslog01:~$ sudo tee /etc/rsyslog.d/10-remote.conf &lt;&lt;'EOF'
module(load="imudp")
input(type="imudp" port="514")
<span class="c"># one file per device, named after its IP address</span>
$template RemoteLogs,"/var/log/remote/%FROMHOST-IP%.log"
if $fromhost-ip != '127.0.0.1' then ?RemoteLogs
&amp; stop
EOF</pre>`,n=`<pre class="code">netadmin@syslog01:~$ ss -uln
netadmin@syslog01:~$ sudo rsyslogd -N1
netadmin@syslog01:~$ sudo systemctl restart rsyslog
netadmin@syslog01:~$ ss -uln</pre>
<pre class="out"><span class="c"># before: only the local DNS cache listens on UDP</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*

rsyslogd: version 8.2312.0, config validation run (level 1), master config /etc/rsyslog.conf
rsyslogd: End of config validation run. Bye.

<span class="c"># after the restart</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port
udp   UNCONN 0      0        127.0.0.53%lo:53        0.0.0.0:*
udp   UNCONN 0      0             0.0.0.0:<span class="hl">514</span>        0.0.0.0:*</pre>`,r=`<pre class="code">netadmin@syslog01:~$ ls -l /var/log/remote
netadmin@syslog01:~$ sudo ss -ulnp | grep 514</pre>
<pre class="out">total 8
-rw-r-----  1 syslog   adm         227 Sep 29 09:00 10.99.0.1.log
-rw-r-----  1 syslog   adm         720 Sep 29 09:00 10.99.0.2.log
udp   UNCONN 0      0             0.0.0.0:514        0.0.0.0:*    users:(("rsyslogd",pid=700,fd=6))</pre>`,i=`<pre class="code"><span class="c"># Reference commands (not run in the simulator): current rsyslog syntax and TCP</span>
module(load="imtcp")
input(type="imtcp" port="514")
template(name="RemoteLogs" type="string" string="/var/log/remote/%FROMHOST-IP%.log")
if $fromhost-ip != '127.0.0.1' then {
    action(type="omfile" dynaFile="RemoteLogs")
    stop
}</pre>`,a={id:`rsyslog-receiver`,h:{en:`Building the receiver: rsyslog listening on UDP 514`,hi:`Receiver banana: rsyslog UDP 514 par sunta hua`},body:{en:`
<p>Ubuntu already runs rsyslog, but only for its own messages: it does <b>not</b> listen on the network until you tell it to. In this chapter you add one small configuration file and turn SYSLOG01 (10.99.0.30) into a collector. Think of a post office: first you open a window (the listening port), then you decide how letters are sorted (the rule), then you give each sender its own pigeonhole (the file).</p>

<h3>Step 0: confirm nothing listens yet</h3>
<p>The command <code>ss</code> shows sockets. <code>-u</code> means UDP, <code>-l</code> listening, <code>-n</code> numbers instead of names. Before the change, only port 53 (the local DNS cache on 127.0.0.53) is there. Nothing on 514 means a router's packet would arrive at a closed door.</p>

<h3>Step 1: the configuration file</h3>
<p>rsyslog reads every <code>.conf</code> file in <code>/etc/rsyslog.d/</code> in alphabetical order. The name <code>10-remote.conf</code> makes ours run before the default <code>50-default.conf</code>, which matters because of <code>stop</code>. The command <code>sudo tee FILE</code> writes what you type into a file as root, ending at the word EOF (a "here document").</p>
`+t+`
<ul>
<li><code>module(load="imudp")</code> loads the UDP input module. A module is a plug-in; without it rsyslog cannot read the network.</li>
<li><code>input(type="imudp" port="514")</code> opens UDP port 514 on all addresses.</li>
<li><code>$template RemoteLogs,"..."</code> defines a file-name pattern. <code>%FROMHOST-IP%</code> is replaced by the sender's address, so R1 goes to <code>10.99.0.1.log</code>. Lines starting with <code>#</code> are comments.</li>
<li><code>if $fromhost-ip != '127.0.0.1' then ?RemoteLogs</code>: if the message did not come from this server itself, write it to the file the template names. The question mark means "treat the template as a dynamic file name".</li>
<li><code>&amp; stop</code> continues the previous rule: after writing, stop processing. Without it the same router line would also land in <code>/var/log/syslog</code> and bury the server's own messages.</li>
</ul>
`+e(`The message path inside rsyslog: input, rule, template, file, stop.`)+`

<h3>Step 2: validate, restart, verify</h3>
<p><code>rsyslogd -N1</code> checks the configuration without starting anything, like a spell check. Then <code>systemctl restart rsyslog</code> applies it, and <code>ss -uln</code> proves the port is open.</p>
`+n+`
<p>If validation prints an error line, fix the file before you restart. A broken file can stop rsyslog from starting, and then even the local logs stop. Always run <code>-N1</code> first.</p>

<h3>Step 3: the files appear by themselves</h3>
<p>You do not create <code>/var/log/remote/10.99.0.1.log</code>. rsyslog creates it when the first message from that address arrives. Seeing a new file is itself the proof that a device is reaching the server.</p>
`+r+`
<p>The files are owned by the <code>syslog</code> user and group <code>adm</code>, mode 640, the same private rule as the other logs. <code>sudo ss -ulnp</code> adds the owning process, so you can confirm that it is <code>rsyslogd</code> that holds port 514 and not some other program.</p>
`+i+`
<p>The legacy <code>$template</code> style used in the lab still works and is common in older guides. The newer block syntax shown above is what current documentation recommends. UDP is lightweight but unreliable. TCP (<code>imtcp</code>) acknowledges delivery, and many routers can send over it, but the simple UDP method is the one the exam and most networks use.</p>

<div class="eg"><p><b>Worked example.</b> You add a third router R3 at 10.99.0.3. You change nothing on the server. When R3 sends its first message, rsyslog creates <code>/var/log/remote/10.99.0.3.log</code>. After ten routers you have ten files, each easy to search: <code>grep -c UPDOWN /var/log/remote/*.log</code> counts link events for every device in one command.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Forgetting the restart (the old configuration keeps running); putting the file in the wrong directory or without the <code>.conf</code> ending (it is ignored); typing the quote characters wrongly. Also remember that opening 514 on the server is not enough if a firewall blocks it. That is chapter 7.</p></div>
<div class="exam"><p><b>Exam trap.</b> The server must have a UDP listener on 514; a TCP-only check such as <code>ss -tln</code> will show nothing and mislead you. Use <code>ss -uln</code> for classic syslog.</p></div>

<div class="scn"><h4>Running, but deaf</h4><p>After a server rebuild the team said "rsyslog is running, why no router logs?" <code>systemctl status</code> showed active. <code>ss -uln</code> showed only port 53. The file <code>10-remote.conf</code> had not been copied back. Restoring it and restarting opened port 514 and files appeared within seconds.</p><p><b>Lesson:</b> active service does not mean listening port. Check the socket, not just the status.</p></div>

<div class="iv"><p class="q">"How do you make rsyslog accept logs from the network and keep one file per device?"</p><p>Load the imudp module, add an input on UDP 514, define a template with the sender IP property (%FROMHOST-IP%), route non-local messages to it and stop further processing. Validate with <code>rsyslogd -N1</code>, restart, confirm with <code>ss -uln</code>, and open UDP 514 only to the management network in the firewall.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>rsyslog does not listen on the network by default; add a file in /etc/rsyslog.d/.</li>
<li>imudp plus input(port 514) opens the socket; a template names the file per sender.</li>
<li><code>&amp; stop</code> keeps router lines out of /var/log/syslog.</li>
<li>Always validate with <code>rsyslogd -N1</code> before <code>systemctl restart rsyslog</code>.</li>
<li>Verify with <code>ss -uln</code>, then watch /var/log/remote fill with one file per device.</li>
</ul></div>
`,hi:`
<p>Ubuntu pehle se rsyslog chalata hai, par sirf apne messages ke liye: jab tak aap na kaho woh network par <b>nahi</b> sunta. Is chapter mein aap ek chhoti configuration file jodte ho aur SYSLOG01 (10.99.0.30) ko collector bana dete ho. Post office socho: pehle aap khidki kholte ho (listening port), phir tay karte ho chitthiyan kaise sort hongi (rule), phir har sender ko apna pigeonhole dete ho (file).</p>

<h3>Step 0: confirm karo ki abhi kuch nahi sun raha</h3>
<p>Command <code>ss</code> sockets dikhata hai. <code>-u</code> matlab UDP, <code>-l</code> listening, <code>-n</code> naam ki jagah numbers. Change se pehle sirf port 53 (127.0.0.53 par local DNS cache) hai. 514 par kuch na hone ka matlab router ka packet band darwaze par pahunchega.</p>

<h3>Step 1: configuration file</h3>
<p>rsyslog <code>/etc/rsyslog.d/</code> ki har <code>.conf</code> file alphabetical order mein padhta hai. Naam <code>10-remote.conf</code> hamari file ko default <code>50-default.conf</code> se pehle chalata hai, jo <code>stop</code> ki wajah se matter karta hai. Command <code>sudo tee FILE</code> jo aap type karte ho use root ban kar file mein likhta hai, EOF shabd par rukta hai (ek "here document").</p>
`+t+`
<ul>
<li><code>module(load="imudp")</code> UDP input module load karta hai. Module ek plug-in hai; uske bina rsyslog network nahi padh sakta.</li>
<li><code>input(type="imudp" port="514")</code> sabhi addresses par UDP port 514 kholta hai.</li>
<li><code>$template RemoteLogs,"..."</code> file-name pattern define karta hai. <code>%FROMHOST-IP%</code> sender ke address se replace hota hai, to R1 <code>10.99.0.1.log</code> mein jaata hai. <code>#</code> se shuru lines comments hain.</li>
<li><code>if $fromhost-ip != '127.0.0.1' then ?RemoteLogs</code>: agar message is server se khud nahi aaya, to use us file mein likho jo template batata hai. Question mark ka matlab "template ko dynamic file name samjho".</li>
<li><code>&amp; stop</code> pichhle rule ko aage badhata hai: likhne ke baad processing roko. Iske bina wahi router line <code>/var/log/syslog</code> mein bhi aati aur server ke apne messages ko dabaa deti.</li>
</ul>
`+e(`rsyslog ke andar message ka raasta: input, rule, template, file, stop.`)+`

<h3>Step 2: validate, restart, verify</h3>
<p><code>rsyslogd -N1</code> configuration ko bina kuch start kiye check karta hai, spell check ki tarah. Phir <code>systemctl restart rsyslog</code> use apply karta hai, aur <code>ss -uln</code> sabit karta hai ki port khula hai.</p>
`+n+`
<p>Agar validation error line print kare, to restart se pehle file theek karo. Toota hua file rsyslog ko start hone se rok sakta hai, aur tab local logs bhi band ho jaate hain. Hamesha pehle <code>-N1</code> chalao.</p>

<h3>Step 3: files apne aap bante hain</h3>
<p>Aap <code>/var/log/remote/10.99.0.1.log</code> khud nahi banate. Us address se pehla message aate hi rsyslog use banata hai. Nayi file dikhna khud saboot hai ki device server tak pahunch raha hai.</p>
`+r+`
<p>Files <code>syslog</code> user aur group <code>adm</code> ki hain, mode 640, baaki logs jaisa hi private rule. <code>sudo ss -ulnp</code> owning process jodta hai, taaki aap confirm kar sako ki port 514 <code>rsyslogd</code> ke paas hai, kisi aur program ke paas nahi.</p>
`+i+`
<p>Lab mein use hua legacy <code>$template</code> style abhi bhi chalta hai aur purani guides mein aam hai. Upar dikhaya naya block syntax woh hai jo current documentation recommend karta hai. UDP halka par unreliable hai. TCP (<code>imtcp</code>) delivery acknowledge karta hai, aur bahut se routers use bhej sakte hain, par simple UDP tareeka woh hai jo exam aur zyadatar networks use karte hain.</p>

<div class="eg"><p><b>Worked example.</b> Aap teesra router R3 10.99.0.3 par jodte ho. Server par kuch nahi badalte. R3 ka pehla message aate hi rsyslog <code>/var/log/remote/10.99.0.3.log</code> banata hai. Das routers ke baad aapke paas das files hain, har ek search karne mein aasaan: <code>grep -c UPDOWN /var/log/remote/*.log</code> ek command mein har device ke link events gintata hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Restart bhool jaana (purani configuration chalti rehti hai); file galat directory mein ya <code>.conf</code> ending ke bina rakhna (ignore hoti hai); quote characters galat type karna. Yeh bhi yaad rakho ki server par 514 kholna kaafi nahi agar firewall use block kare. Woh chapter 7 hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Server par 514 par UDP listener hona chahiye; <code>ss -tln</code> jaisa TCP-only check kuch nahi dikhayega aur galat raah dikhayega. Classic syslog ke liye <code>ss -uln</code> use karo.</p></div>

<div class="scn"><h4>Chal raha hai, par behra</h4><p>Server rebuild ke baad team ne kaha "rsyslog chal raha hai, router logs kyun nahi?" <code>systemctl status</code> ne active dikhaya. <code>ss -uln</code> ne sirf port 53 dikhaya. File <code>10-remote.conf</code> wapas copy nahi hui thi. Use restore karke restart karne se port 514 khula aur kuch seconds mein files aa gayi.</p><p><b>Lesson:</b> active service ka matlab listening port nahi. Sirf status nahi, socket check karo.</p></div>

<div class="iv"><p class="q">"rsyslog ko network se logs lene aur har device ki ek file rakhne ke liye kaise banate ho?"</p><p>imudp module load karo, UDP 514 par input jodo, sender IP property (%FROMHOST-IP%) wala template define karo, non-local messages ko uski taraf route karo aur aage ki processing roko. <code>rsyslogd -N1</code> se validate karo, restart karo, <code>ss -uln</code> se confirm karo, aur firewall mein UDP 514 sirf management network ke liye kholo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>rsyslog default mein network par nahi sunta; /etc/rsyslog.d/ mein file jodo.</li>
<li>imudp aur input(port 514) socket kholte hain; template har sender ki file ka naam banata hai.</li>
<li><code>&amp; stop</code> router lines ko /var/log/syslog se bahar rakhta hai.</li>
<li><code>systemctl restart rsyslog</code> se pehle hamesha <code>rsyslogd -N1</code> se validate karo.</li>
<li><code>ss -uln</code> se verify karo, phir /var/log/remote ko har device ki ek file se bharte dekho.</li>
</ul></div>
`}};export{a as default};