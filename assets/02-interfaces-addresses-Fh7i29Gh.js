var e={id:`interfaces-addresses`,h:{en:`Interfaces and addresses: ip link and ip addr`,hi:`Interfaces aur addresses: ip link aur ip addr`},body:{en:`
<p>On a router you type <code>show ip interface brief</code> and read one line per interface. On Linux the same job is done by one command with a short name: <code>ip</code>. The word <code>ip</code> is followed by an <b>object</b> (what you talk about: <code>link</code>, <code>addr</code>, <code>route</code>, <code>neigh</code>) and then an action. Think of it as a sentence: "ip, show me the addresses".</p>

<h3>Step 1: what interfaces exist? (ip link)</h3>
<p>A <b>network interface</b> is the server's network card, real or virtual. <code>ip link</code> shows layer 2 only: state, MAC address and MTU (largest frame).</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip link</span>
1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: <span class="hl">eth0</span>: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 00:50:28:ae:fb:01 brd ff:ff:ff:ff:ff:ff</pre>
<p>Two interfaces appear. <code>lo</code> is the <b>loopback</b>, the server talking to itself at 127.0.0.1, just like a router's Loopback0. <code>eth0</code> is the real Ethernet interface. The words in angle brackets are <b>flags</b>: <code>UP</code> means the interface is enabled (no shutdown), <code>LOWER_UP</code> means the cable carries a signal. The part after <code>mtu</code> is the maximum frame size, 1500 bytes as usual. <code>link/ether</code> is the MAC address.</p>

<h3>How to read the state</h3>
<table class="cmp"><tr><th>You see</th><th>Router word</th><th>Meaning</th></tr>
<tr><td><code>UP</code> and <code>LOWER_UP</code></td><td>up / up</td><td>Enabled and link is good</td></tr>
<tr><td><code>NO-CARRIER</code> (with UP)</td><td>up / down</td><td>Enabled but no cable or far end down</td></tr>
<tr><td><code>DOWN</code></td><td>administratively down</td><td>Someone ran <code>ip link set ... down</code></td></tr>
</table>
<p>Interface names matter. Old servers say <code>eth0</code>. Many newer ones use "predictable" names like <code>ens160</code> or <code>enp0s3</code>. A configuration written for the wrong name configures nothing, so always read the real name first. That is exactly the trap in Lab 1.</p>

<h3>Step 2: what addresses do they have? (ip addr)</h3>
<p><code>ip a</code> is short for <code>ip addr show</code>. The brief option <code>-br</code> prints one line per interface, the Linux twin of "show ip interface brief":</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             <span class="hl">10.30.0.10/24</span></pre>
<p>Linux writes the address in <b>CIDR</b> form: 10.30.0.10/24 means address 10.30.0.10 with mask 255.255.255.0. The full form adds the broadcast address and lifetimes:</p>
<pre class="out">netadmin@syslog02:~$ ip addr show dev eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:50:28:ae:fb:01 brd ff:ff:ff:ff:ff:ff
    inet <span class="hl">10.30.0.10/24</span> brd 10.30.0.255 scope global eth0
       valid_lft forever preferred_lft forever</pre>
<p><code>inet</code> means IPv4, <code>brd</code> is the broadcast address, <code>scope global</code> means a normal routable address. <code>valid_lft forever</code> means it never expires (a DHCP address would show a countdown).</p>

<h3>Step 3: give the interface an address (temporarily)</h3>
<pre class="code"><span class="c"># sudo = run as administrator; ip addr add ADDRESS/PREFIX dev INTERFACE</span>
sudo ip addr add 10.30.0.10/24 dev eth0
<span class="c"># take it away again</span>
sudo ip addr del 10.30.0.10/24 dev eth0
<span class="c"># shutdown / no shutdown</span>
sudo ip link set eth0 down
sudo ip link set eth0 up</pre>
<p>A normal user is refused. Without <code>sudo</code> the simulator answers:</p>
<pre class="out">netadmin@syslog02:~$ ip addr add 10.30.0.10/24 dev eth0
<span class="hl">RTNETLINK answers: Operation not permitted</span></pre>
<p>This message sounds scary but just means "you need sudo". After <code>sudo ip link set eth0 down</code> the brief view shows <code>eth0  DOWN  10.30.0.10/24</code>, and after <code>up</code> it returns to <code>UP</code>. Notice the address stays on the interface while it is down, like a router's shutdown interface.</p>

<div class="eg"><p><b>Worked example.</b> Server syslog02 shows eth0 UP without an address. You run <code>sudo ip addr add 10.30.0.10/24 dev eth0</code> and <code>ip -br a</code> now lists 10.30.0.10/24. <code>ip route</code> immediately shows a new line <code>10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</code>. Linux created the connected route by itself, just like a router does. A ping to the gateway 10.30.0.1 now answers.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Forgetting the prefix. <code>ip addr add 10.30.0.10 dev eth0</code> (without /24) creates a /32 and no connected route, so nothing works. Always type the prefix length.</p></div>
<div class="exam"><p><b>Exam trap.</b> Addresses added with <code>ip addr add</code> are gone after a reboot. The same is true when someone runs <code>netplan apply</code> with a file that does not contain the address: the file wins.</p></div>

<div class="scn"><h4>Port up, but no address</h4><p>The console showed <code>eth0 UP</code> and nothing else. The engineer added the address with <code>ip addr add</code>, the server pinged the gateway, and everybody went home. After the next maintenance reboot the server was dark again, because nobody wrote the address into netplan.</p><p><b>Lesson:</b> a fix that survives only until the next reboot is not a fix. Chapter 4 shows the permanent version.</p></div>

<div class="iv"><p class="q">"How do you check the IP address of a Linux server?"</p><p>I run <code>ip -br a</code> for the one-line view and <code>ip addr show dev eth0</code> for the detail. I do not rely on ifconfig because it is not installed by default. I also check <code>ip link</code> for the interface state and name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip link</code> is layer 2; <code>ip addr</code> is layer 3; <code>-br</code> gives the brief one-line view.</li>
<li>Read the flags: UP and LOWER_UP mean enabled with a good link.</li>
<li>Check the real interface name (eth0 or ens160) before configuring.</li>
<li>Changes need <code>sudo</code>; without it you get "Operation not permitted".</li>
<li>Always include the prefix, for example /24.</li>
</ul></div>
`,hi:`
<p>Router par aap <code>show ip interface brief</code> type karte ho aur har interface ki ek line padhte ho. Linux par yahi kaam ek chhote naam wala command karta hai: <code>ip</code>. <code>ip</code> ke baad ek <b>object</b> aata hai (kis ke baare mein baat: <code>link</code>, <code>addr</code>, <code>route</code>, <code>neigh</code>) aur phir action. Ise ek vakya samjho: "ip, mujhe addresses dikhao".</p>

<h3>Step 1: kaunse interfaces hain? (ip link)</h3>
<p><b>Network interface</b> server ka network card hai, real ho ya virtual. <code>ip link</code> sirf layer 2 dikhata hai: state, MAC address aur MTU (sabse bada frame).</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip link</span>
1: lo: &lt;LOOPBACK,UP,LOWER_UP&gt; mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: <span class="hl">eth0</span>: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 00:50:28:ae:fb:01 brd ff:ff:ff:ff:ff:ff</pre>
<p>Do interfaces dikhte hain. <code>lo</code> <b>loopback</b> hai, server khud se 127.0.0.1 par baat karta hai, bilkul router ke Loopback0 jaisa. <code>eth0</code> asli Ethernet interface hai. Angle brackets ke andar ke words <b>flags</b> hain: <code>UP</code> matlab interface enabled hai (no shutdown), <code>LOWER_UP</code> matlab cable par signal hai. <code>mtu</code> ke baad maximum frame size hai, hamesha ki tarah 1500 bytes. <code>link/ether</code> MAC address hai.</p>

<h3>State kaise padhein</h3>
<table class="cmp"><tr><th>Aap dekhte ho</th><th>Router ka word</th><th>Matlab</th></tr>
<tr><td><code>UP</code> aur <code>LOWER_UP</code></td><td>up / up</td><td>Enabled aur link theek</td></tr>
<tr><td><code>NO-CARRIER</code> (UP ke saath)</td><td>up / down</td><td>Enabled par cable nahi ya doosra end down</td></tr>
<tr><td><code>DOWN</code></td><td>administratively down</td><td>Kisi ne <code>ip link set ... down</code> chalaya</td></tr>
</table>
<p>Interface ke naam matter karte hain. Purane servers <code>eth0</code> kehte hain. Kai naye "predictable" naam use karte hain jaise <code>ens160</code> ya <code>enp0s3</code>. Galat naam ke liye likhi configuration kuch configure nahi karti, isliye pehle asli naam padho. Lab 1 ka trap yahi hai.</p>

<h3>Step 2: unke paas kaunse addresses hain? (ip addr)</h3>
<p><code>ip a</code>, <code>ip addr show</code> ka short form hai. Brief option <code>-br</code> har interface ki ek line deta hai, "show ip interface brief" ka Linux jodidaar:</p>
<pre class="out">netadmin@syslog02:~$ <span class="hl">ip -br a</span>
lo               UNKNOWN        127.0.0.1/8 ::1/128
eth0             UP             <span class="hl">10.30.0.10/24</span></pre>
<p>Linux address <b>CIDR</b> form mein likhta hai: 10.30.0.10/24 matlab address 10.30.0.10 aur mask 255.255.255.0. Poora form broadcast address aur lifetimes bhi jodta hai:</p>
<pre class="out">netadmin@syslog02:~$ ip addr show dev eth0
2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:50:28:ae:fb:01 brd ff:ff:ff:ff:ff:ff
    inet <span class="hl">10.30.0.10/24</span> brd 10.30.0.255 scope global eth0
       valid_lft forever preferred_lft forever</pre>
<p><code>inet</code> matlab IPv4, <code>brd</code> broadcast address hai, <code>scope global</code> matlab normal routable address. <code>valid_lft forever</code> matlab kabhi expire nahi hota (DHCP address mein countdown dikhta).</p>

<h3>Step 3: interface ko address do (temporarily)</h3>
<pre class="code"><span class="c"># sudo = administrator ki tarah chalao; ip addr add ADDRESS/PREFIX dev INTERFACE</span>
sudo ip addr add 10.30.0.10/24 dev eth0
<span class="c"># wapas hatao</span>
sudo ip addr del 10.30.0.10/24 dev eth0
<span class="c"># shutdown / no shutdown</span>
sudo ip link set eth0 down
sudo ip link set eth0 up</pre>
<p>Normal user ko mana kar diya jaata hai. <code>sudo</code> ke bina simulator jawab deta hai:</p>
<pre class="out">netadmin@syslog02:~$ ip addr add 10.30.0.10/24 dev eth0
<span class="hl">RTNETLINK answers: Operation not permitted</span></pre>
<p>Yeh message darawna lagta hai par matlab sirf "sudo chahiye". <code>sudo ip link set eth0 down</code> ke baad brief view <code>eth0  DOWN  10.30.0.10/24</code> dikhata hai, aur <code>up</code> ke baad wapas <code>UP</code>. Dhyan do ki down hone par bhi address interface par rehta hai, router ke shutdown interface jaisa.</p>

<div class="eg"><p><b>Worked example.</b> Server syslog02 mein eth0 UP hai par address nahi. Aap <code>sudo ip addr add 10.30.0.10/24 dev eth0</code> chalate ho aur <code>ip -br a</code> ab 10.30.0.10/24 dikhata hai. <code>ip route</code> turant nayi line dikhata hai <code>10.30.0.0/24 dev eth0 proto kernel scope link src 10.30.0.10</code>. Linux ne connected route khud bana liya, bilkul router ki tarah. Gateway 10.30.0.1 ko ping ab jawab deta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Prefix bhool jaana. <code>ip addr add 10.30.0.10 dev eth0</code> (bina /24) /32 banata hai aur connected route nahi banta, to kuch nahi chalta. Hamesha prefix length likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>ip addr add</code> se jode addresses reboot ke baad chale jaate hain. Yahi tab hota hai jab koi aisi file ke saath <code>netplan apply</code> chalata hai jisme address nahi hai: file jeet jaati hai.</p></div>

<div class="scn"><h4>Port up, par address nahi</h4><p>Console par sirf <code>eth0 UP</code> dikha. Engineer ne <code>ip addr add</code> se address diya, server ne gateway ping kiya, aur sab ghar chale gaye. Agle maintenance reboot ke baad server phir andhera ho gaya, kyunki kisi ne address netplan mein likha hi nahi.</p><p><b>Lesson:</b> jo fix sirf agle reboot tak chale woh fix nahi hai. Chapter 4 permanent version dikhata hai.</p></div>

<div class="iv"><p class="q">"Linux server ka IP address kaise check karte ho?"</p><p>Ek line ke view ke liye <code>ip -br a</code> aur detail ke liye <code>ip addr show dev eth0</code>. Main ifconfig par depend nahi karta kyunki woh default install nahi hota. Interface ki state aur naam ke liye <code>ip link</code> bhi dekhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ip link</code> layer 2 hai; <code>ip addr</code> layer 3; <code>-br</code> brief ek-line view deta hai.</li>
<li>Flags padho: UP aur LOWER_UP matlab enabled aur link theek.</li>
<li>Configure karne se pehle asli interface name (eth0 ya ens160) check karo.</li>
<li>Changes ke liye <code>sudo</code> chahiye; bina uske "Operation not permitted".</li>
<li>Prefix hamesha likho, jaise /24.</li>
</ul></div>
`}};export{e as default};