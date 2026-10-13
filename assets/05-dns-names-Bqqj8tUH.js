var e={id:`dns-names`,h:{en:`Names instead of numbers: /etc/hosts, the DNS resolver, dig and nslookup`,hi:`Numbers ki jagah names: /etc/hosts, DNS resolver, dig aur nslookup`},body:{en:`
<p>People type <code>nms.nk.lab</code>; networks forward packets to <code>10.10.0.10</code>. Something has to translate. That translator is the <b>resolver</b>, a small part of Linux that applications call. It looks in two places, in order: first the local file <code>/etc/hosts</code> (a tiny private phone book), then the <b>DNS</b> servers listed for the machine (the big shared phone book). The first answer wins.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Resolver looks in /etc/hosts first then asks the DNS server from resolv.conf">
<rect x="20" y="55" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="14">ping nms.nk.lab</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">application</text>
<rect x="215" y="20" width="170" height="50" rx="10" fill="#fde68a"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="13">1. /etc/hosts</text>
<rect x="215" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="300" y="130" text-anchor="middle" class="svg-ink" font-size="13">2. DNS 10.30.0.1</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">10.10.0.10</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">the answer</text>
<line x1="150" y1="75" x2="215" y2="48" stroke="#64748b" stroke-width="2"/><line x1="150" y1="95" x2="215" y2="122" stroke="#64748b" stroke-width="2"/><line x1="385" y1="48" x2="470" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="125" x2="470" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Names are looked up in /etc/hosts first, then in DNS.</p></div>

<h3>Where the server learns its DNS server</h3>
<p>On Ubuntu the DNS server comes from the <code>nameservers</code> block of the netplan file (Chapter 4). It ends up in <code>/etc/resolv.conf</code>. On a real Ubuntu server this file often points at a local helper (<code>127.0.0.53</code>, the systemd-resolved stub) and <code>resolvectl status</code> shows the real upstream servers. In the simulator the same information looks like this after Lab 1:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">cat /etc/resolv.conf</span>
nameserver 10.30.0.1
search nk.lab

netadmin@syslog02:~$ <span class="hl">resolvectl status</span>
Global
       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported

Link 2 (eth0)
    Current Scopes: DNS
       DNS Servers: 10.30.0.1</pre>
<p><code>nameserver</code> is the DNS server to ask. <code>search nk.lab</code> is the <b>search domain</b>: if you type just <code>nms</code>, the resolver also tries <code>nms.nk.lab</code>.</p>

<h3>Test the name the way applications see it: getent</h3>
<p><code>getent hosts NAME</code> uses exactly the same path as applications (hosts file, then DNS), so it is the truth-teller:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">getent hosts nms.nk.lab</span>
10.10.0.10      nms.nk.lab

netadmin@syslog02:~$ ping -c 2 nms.nk.lab
PING nms.nk.lab (10.10.0.10) 56(84) bytes of data.
64 bytes from nms.nk.lab (10.10.0.10): icmp_seq=1 ttl=63 time=0.50 ms
64 bytes from nms.nk.lab (10.10.0.10): icmp_seq=2 ttl=63 time=0.60 ms</pre>

<h3>Ask DNS directly: dig, nslookup, host</h3>
<p>These tools skip <code>/etc/hosts</code> and speak to a DNS server, so they tell you whether the <b>DNS server</b> is at fault. They live in the package <code>dnsutils</code>, which a fresh server may lack:</p>
<pre class="out">netadmin@syslog02:~$ dig nms.nk.lab
Command 'dig' not found, but can be installed with:
sudo apt install dnsutils</pre>
<p>After <code>sudo apt update</code> and <code>sudo apt install -y dnsutils</code> (Chapter 2 of the services module explains apt), the tools work:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">dig +short nms.nk.lab</span>
10.10.0.10

netadmin@syslog02:~$ <span class="hl">nslookup nms.nk.lab 10.30.0.1</span>
Server:		10.30.0.1
Address:	10.30.0.1#53

Name:	nms.nk.lab
Address: 10.10.0.10

netadmin@syslog02:~$ host nms.nk.lab
nms.nk.lab has address 10.10.0.10</pre>
<p><code>dig +short</code> prints only the answer. <code>nslookup NAME SERVER</code> asks one specific server, which is how you compare a good server and a bad one. In the full <code>dig</code> output the <code>ANSWER SECTION</code> carries the record, the number after the name is the TTL (how long it may be cached), and the <code>SERVER:</code> line tells you who answered.</p>

<h3>The ticket "works by IP, not by name"</h3>
<p>This is the classic. Lab 2 recreates it: the server pings 10.10.0.10 fine, but names fail. The evidence, captured from the simulator:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 nms.nk.lab
<span class="hl">ping: nms.nk.lab: Temporary failure in name resolution</span>
netadmin@syslog02:~$ cat /etc/resolv.conf
nameserver <span class="hl">10.30.0.53</span>
search nk.lab
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.53
;; communications error to 10.30.0.53#53: timed out
;; no servers could be reached
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.1
Server:		10.30.0.1
Address:	10.30.0.1#53
Name:	nms.nk.lab
Address: 10.10.0.10</pre>
<p>Routing works (the IP ping succeeded), so the problem is only name resolution. The configured DNS server 10.30.0.53 is dead or wrong; the real one, 10.30.0.1, answers. The fix goes in the netplan file (change the <code>nameservers</code> address, <code>sudo netplan apply</code>), because netplan regenerates resolver settings and would undo a hand edit.</p>

<h3>A local name without DNS: /etc/hosts</h3>
<p>For a device that is not in DNS, add a line: IP, then name.</p>
<pre class="code">echo '10.30.0.2 core-sw' | sudo tee -a /etc/hosts
getent hosts core-sw
ping -c 2 core-sw</pre>
<p><code>tee -a</code> appends to the file as administrator (a plain <code>sudo echo ... &gt;&gt; file</code> fails because the redirect runs as you, not as root). The ping now shows <code>PING core-sw (10.30.0.2)</code>. Use this for a few names; for many, fix DNS.</p>

<div class="eg"><p><b>Worked example.</b> Users say the NMS page opens by IP but not by name. You run <code>getent hosts nms.nk.lab</code> and get nothing, <code>cat /etc/resolv.conf</code> shows a nameserver nobody recognises, and <code>nslookup nms.nk.lab 10.30.0.1</code> works. Conclusion: wrong DNS server in config, not a routing or firewall fault.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Testing DNS with ping only. A ping to a name mixes DNS, routing and ICMP. Use <code>getent</code> or <code>dig</code> first, then ping the IP, to separate the layers.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS uses UDP port 53 (and TCP 53 for large answers). "Temporary failure in name resolution" means no server answered; "Name or service not known" means a server answered but the name does not exist (or the lookup failed to find it).</p></div>

<div class="scn"><h4>Everything is up, but nothing has a name</h4><p>After a DNS server migration, dozens of servers lost name resolution. Pings to IP worked, so the network team found nothing. A server engineer compared <code>/etc/resolv.conf</code> to the netplan file and found the old DNS address in every template. One change in the template, one <code>netplan apply</code> per host, and names returned.</p><p><b>Lesson:</b> if IP works and names fail, stop looking at routes and check the resolver.</p></div>

<div class="iv"><p class="q">"Ping by IP works but ping by hostname fails. What do you check?"</p><p>Name resolution. I look at <code>/etc/resolv.conf</code> (or <code>resolvectl status</code>) for the DNS server, test it with <code>dig</code> or <code>nslookup NAME SERVER</code>, check <code>/etc/hosts</code>, and fix the nameserver in netplan if it is wrong, so it survives a reboot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The resolver checks <code>/etc/hosts</code> first, then the DNS servers.</li>
<li>DNS servers come from netplan <code>nameservers</code> and end up in resolv.conf.</li>
<li><code>getent hosts</code> shows what applications get; <code>dig</code> and <code>nslookup</code> ask DNS only.</li>
<li><code>dig</code>, <code>nslookup</code>, <code>host</code> come from the <code>dnsutils</code> package.</li>
<li>Fix DNS in netplan, not by hand-editing resolv.conf.</li>
</ul></div>
`,hi:`
<p>Log <code>nms.nk.lab</code> type karte hain; networks packets <code>10.10.0.10</code> ko forward karte hain. Koi to translate karega. Woh translator <b>resolver</b> hai, Linux ka ek chhota hissa jise applications call karti hain. Woh do jagah dekhta hai, order mein: pehle local file <code>/etc/hosts</code> (ek chhoti private phone book), phir machine ke liye listed <b>DNS</b> servers (badi shared phone book). Pehla jawab jeet jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Resolver pehle /etc/hosts dekhta hai phir resolv.conf wale DNS server se poochta hai">
<rect x="20" y="55" width="130" height="60" rx="10" fill="#bbf7d0"/><text x="85" y="82" text-anchor="middle" class="svg-ink" font-size="14">ping nms.nk.lab</text><text x="85" y="100" text-anchor="middle" class="svg-muted" font-size="12">application</text>
<rect x="215" y="20" width="170" height="50" rx="10" fill="#fde68a"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="13">1. /etc/hosts</text>
<rect x="215" y="100" width="170" height="50" rx="10" fill="#bae6fd"/><text x="300" y="130" text-anchor="middle" class="svg-ink" font-size="13">2. DNS 10.30.0.1</text>
<rect x="470" y="55" width="150" height="60" rx="10" fill="#ddd6fe"/><text x="545" y="82" text-anchor="middle" class="svg-ink" font-size="14">10.10.0.10</text><text x="545" y="100" text-anchor="middle" class="svg-muted" font-size="12">jawab</text>
<line x1="150" y1="75" x2="215" y2="48" stroke="#64748b" stroke-width="2"/><line x1="150" y1="95" x2="215" y2="122" stroke="#64748b" stroke-width="2"/><line x1="385" y1="48" x2="470" y2="75" stroke="#64748b" stroke-width="2"/><line x1="385" y1="125" x2="470" y2="95" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Names pehle /etc/hosts mein, phir DNS mein dhoondhe jaate hain.</p></div>

<h3>Server ko apna DNS server kahan se milta hai</h3>
<p>Ubuntu par DNS server netplan file ke <code>nameservers</code> block se aata hai (Chapter 4). Woh <code>/etc/resolv.conf</code> mein pahunchta hai. Asli Ubuntu server par yeh file aksar local helper (<code>127.0.0.53</code>, systemd-resolved stub) ki taraf point karti hai aur <code>resolvectl status</code> asli upstream servers dikhata hai. Simulator mein Lab 1 ke baad wahi jaankari aisi dikhti hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">cat /etc/resolv.conf</span>
nameserver 10.30.0.1
search nk.lab

netadmin@syslog02:~$ <span class="hl">resolvectl status</span>
Global
       Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported

Link 2 (eth0)
    Current Scopes: DNS
       DNS Servers: 10.30.0.1</pre>
<p><code>nameserver</code> woh DNS server hai jisse poochna hai. <code>search nk.lab</code> <b>search domain</b> hai: aap sirf <code>nms</code> type karo to resolver <code>nms.nk.lab</code> bhi try karta hai.</p>

<h3>Name ko waise test karo jaise applications dekhti hain: getent</h3>
<p><code>getent hosts NAME</code> bilkul wahi raasta use karta hai jo applications karti hain (hosts file, phir DNS), isliye woh sach batata hai:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">getent hosts nms.nk.lab</span>
10.10.0.10      nms.nk.lab

netadmin@syslog02:~$ ping -c 2 nms.nk.lab
PING nms.nk.lab (10.10.0.10) 56(84) bytes of data.
64 bytes from nms.nk.lab (10.10.0.10): icmp_seq=1 ttl=63 time=0.50 ms
64 bytes from nms.nk.lab (10.10.0.10): icmp_seq=2 ttl=63 time=0.60 ms</pre>

<h3>DNS se seedha poocho: dig, nslookup, host</h3>
<p>Yeh tools <code>/etc/hosts</code> skip karke DNS server se baat karte hain, isliye batate hain ki kya <b>DNS server</b> galat hai. Yeh <code>dnsutils</code> package mein hain, jo fresh server par na ho sakta hai:</p>
<pre class="out">netadmin@syslog02:~$ dig nms.nk.lab
Command 'dig' not found, but can be installed with:
sudo apt install dnsutils</pre>
<p><code>sudo apt update</code> aur <code>sudo apt install -y dnsutils</code> ke baad (apt services module ke Chapter 2 mein samjhaya hai) tools chalte hain:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">dig +short nms.nk.lab</span>
10.10.0.10

netadmin@syslog02:~$ <span class="hl">nslookup nms.nk.lab 10.30.0.1</span>
Server:		10.30.0.1
Address:	10.30.0.1#53

Name:	nms.nk.lab
Address: 10.10.0.10

netadmin@syslog02:~$ host nms.nk.lab
nms.nk.lab has address 10.10.0.10</pre>
<p><code>dig +short</code> sirf jawab print karta hai. <code>nslookup NAME SERVER</code> ek specific server se poochta hai, isi se achhe aur kharab server ki tulna hoti hai. Poore <code>dig</code> output mein <code>ANSWER SECTION</code> record rakhta hai, naam ke baad ka number TTL hai (kitni der cache ho sakta hai), aur <code>SERVER:</code> line batati hai kisne jawab diya.</p>

<h3>Ticket "IP se chalta hai, naam se nahi"</h3>
<p>Yeh classic hai. Lab 2 ise dobara banata hai: server 10.10.0.10 ko theek ping karta hai, par names fail. Simulator se capture kiya saboot:</p>
<pre class="out">netadmin@syslog02:~$ ping -c 2 nms.nk.lab
<span class="hl">ping: nms.nk.lab: Temporary failure in name resolution</span>
netadmin@syslog02:~$ cat /etc/resolv.conf
nameserver <span class="hl">10.30.0.53</span>
search nk.lab
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.53
;; communications error to 10.30.0.53#53: timed out
;; no servers could be reached
netadmin@syslog02:~$ nslookup nms.nk.lab 10.30.0.1
Server:		10.30.0.1
Address:	10.30.0.1#53
Name:	nms.nk.lab
Address: 10.10.0.10</pre>
<p>Routing chalti hai (IP ping succeed hua), isliye problem sirf name resolution hai. Configured DNS server 10.30.0.53 dead ya galat hai; asli, 10.30.0.1, jawab deta hai. Fix netplan file mein jaata hai (<code>nameservers</code> ka address badlo, <code>sudo netplan apply</code>), kyunki netplan resolver settings dobara banata hai aur haath ka edit undo kar deta.</p>

<h3>DNS ke bina local name: /etc/hosts</h3>
<p>Jo device DNS mein nahi, uske liye ek line jodo: IP, phir naam.</p>
<pre class="code">echo '10.30.0.2 core-sw' | sudo tee -a /etc/hosts
getent hosts core-sw
ping -c 2 core-sw</pre>
<p><code>tee -a</code> file mein administrator ki tarah append karta hai (seedha <code>sudo echo ... &gt;&gt; file</code> fail hota hai kyunki redirect aap ke naam se chalta hai, root ke nahi). Ab ping <code>PING core-sw (10.30.0.2)</code> dikhata hai. Kuch names ke liye yeh use karo; bahut ho to DNS theek karo.</p>

<div class="eg"><p><b>Worked example.</b> Users kehte hain NMS page IP se khulta hai par naam se nahi. Aap <code>getent hosts nms.nk.lab</code> chalate ho, kuch nahi milta; <code>cat /etc/resolv.conf</code> aisa nameserver dikhata hai jise koi nahi pehchanta, aur <code>nslookup nms.nk.lab 10.30.0.1</code> chalta hai. Conclusion: config mein galat DNS server, routing ya firewall ki galti nahi.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> DNS ko sirf ping se test karna. Naam par ping DNS, routing aur ICMP ko mila deta hai. Pehle <code>getent</code> ya <code>dig</code>, phir IP ping, taaki layers alag ho jaayein.</p></div>
<div class="exam"><p><b>Exam trap.</b> DNS UDP port 53 use karta hai (bade answers ke liye TCP 53). "Temporary failure in name resolution" matlab kisi server ne jawab nahi diya; "Name or service not known" matlab server ne jawab diya par naam exist nahi karta.</p></div>

<div class="scn"><h4>Sab up hai, par kisi ka naam nahi</h4><p>DNS server migration ke baad darjano servers ka name resolution chala gaya. IP ke pings chal rahe the, isliye network team ko kuch nahi mila. Server engineer ne <code>/etc/resolv.conf</code> ko netplan file se milaya aur har template mein purana DNS address paya. Template mein ek change, har host par ek <code>netplan apply</code>, aur names wapas aa gaye.</p><p><b>Lesson:</b> IP chale aur names fail hon to routes dekhna band karo aur resolver check karo.</p></div>

<div class="iv"><p class="q">"IP se ping chalta hai par hostname se fail. Kya check karoge?"</p><p>Name resolution. Main <code>/etc/resolv.conf</code> (ya <code>resolvectl status</code>) mein DNS server dekhta hoon, <code>dig</code> ya <code>nslookup NAME SERVER</code> se test karta hoon, <code>/etc/hosts</code> check karta hoon, aur nameserver galat ho to netplan mein theek karta hoon taaki reboot ke baad bhi rahe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Resolver pehle <code>/etc/hosts</code>, phir DNS servers dekhta hai.</li>
<li>DNS servers netplan <code>nameservers</code> se aate hain aur resolv.conf mein pahunchte hain.</li>
<li><code>getent hosts</code> woh dikhata hai jo applications ko milta hai; <code>dig</code> aur <code>nslookup</code> sirf DNS se poochte hain.</li>
<li><code>dig</code>, <code>nslookup</code>, <code>host</code> <code>dnsutils</code> package se aate hain.</li>
<li>DNS netplan mein theek karo, resolv.conf haath se edit karke nahi.</li>
</ul></div>
`}};export{e as default};