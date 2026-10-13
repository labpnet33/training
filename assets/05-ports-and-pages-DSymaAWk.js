var e={id:`ports-and-pages`,h:{en:`Which port, which page: ss, curl and the web root`,hi:`Kaunsa port, kaunsa page: ss, curl aur web root`},body:{en:`
<p>A service that is "active" is not necessarily reachable. Between the program and the user stand a <b>port</b> and a <b>file</b> or two. In this chapter you prove what nginx listens on, change the page it serves, and test it from the server and from a client.</p>

<h3>Which port is it listening on?</h3>
<p><code>ss</code> shows sockets. Flags: <code>-t</code> TCP, <code>-l</code> listening, <code>-n</code> numbers instead of names, <code>-p</code> the program that owns each socket (needs sudo to see other users' programs).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo ss -tlnp</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      4096     127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=402,fd=3))
tcp   LISTEN 0      4096           0.0.0.0:22        0.0.0.0:*    users:(("sshd",pid=701,fd=3))
tcp   LISTEN 0      4096           0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=700,fd=3))</pre>
<p>Read the <b>Local Address:Port</b> column. <code>0.0.0.0:80</code> means "port 80 on every address of this server", owned by nginx. A line like <code>127.0.0.53%lo:53</code> means the DNS resolver listens only on the loopback, so other machines cannot use it. For a network engineer this is the Linux version of "show control-plane host open-ports".</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Request path: client curl to port 80, nginx, file index.html in /var/www/html">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">WS01 curl</text><text x="70" y="98" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.20</text>
<rect x="250" y="50" width="130" height="70" rx="8" fill="#fde68a"/><text x="315" y="80" text-anchor="middle" class="svg-ink" font-size="12">nginx</text><text x="315" y="98" text-anchor="middle" class="svg-ink" font-size="12">listens on :80</text>
<rect x="500" y="50" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="80" text-anchor="middle" class="svg-ink" font-size="11">/var/www/html/</text><text x="565" y="98" text-anchor="middle" class="svg-ink" font-size="12">index.html</text>
<line x1="130" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Port first, then the file that nginx hands back.</p></div>

<h3>What does it serve?</h3>
<p>The default page comes with the package. <code>curl localhost</code> fetches from the server itself (<code>localhost</code> means "this machine").</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">curl localhost</span>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;Welcome to nginx!&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;h1&gt;Welcome to nginx!&lt;/h1&gt;
&lt;p&gt;If you see this page, the nginx web server is successfully installed and working.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
<p>That page lives in <code>/var/www/html/index.html</code>, the <b>web root</b>. Replace it with a one-line NOC page. <code>tee</code> writes its input to the file, and <code>sudo tee</code> lets it write into a protected folder (a plain <code>&gt;</code> redirect would run as you, not as root, and fail).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">echo "&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;" | sudo tee /var/www/html/index.html</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;
netadmin@nms02:~$ <span class="hl">curl localhost</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>No reload was needed: nginx reads static files on every request. Only <b>configuration</b> changes need a reload.</p>

<h3>Test like a user</h3>
<pre class="out">priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>Success from WS01 proves four things at once: the service is up, the port is open, the server address is reachable, and the content is right. If it fails from the client but works from <code>localhost</code>, suspect the network or a firewall, not nginx.</p>

<h3>Where the configuration lives</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">ls /etc/nginx</span>
nginx.conf  sites-available</pre>
<p>The main file is <code>/etc/nginx/nginx.conf</code>; the folder holds per-site files. In this lab we only read the folder name; editing nginx is a different course.</p>

<h3>Reference (not run in the simulator)</h3>
<pre class="code">sudo nginx -t          <span class="c"># check nginx config syntax (the nginx twin of sshd -t)</span>
curl -I localhost      <span class="c"># show only the response headers</span>
curl -v 10.99.0.20     <span class="c"># show the whole conversation</span></pre>

<div class="eg"><p><b>Worked example.</b> The NOC says the status page shows the wrong text. You confirm the port with <code>sudo ss -tlnp</code>, replace the file with <code>sudo tee</code>, check <code>curl localhost</code>, then ask Priya to run <code>curl 10.99.0.20</code> from WS01. Five commands, no restart needed.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Testing only with <code>curl localhost</code> and declaring success. The page may work on the server but be blocked on the network. Always test from the client too.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>0.0.0.0:80</code> means all addresses; <code>127.0.0.1:80</code> means loopback only, so remote clients cannot connect.</p></div>

<div class="scn"><h4>Works on the server, dead from outside</h4><p>An engineer's page loaded on the server but not from desks. <code>ss</code> showed the service bound to 127.0.0.1 only. One setting change made it listen on all addresses and the page appeared.</p><p><b>Lesson:</b> read the local address column, not just the port.</p></div>

<div class="iv"><p class="q">"How do you check which process is listening on a port?"</p><p>I run <code>sudo ss -tlnp</code>. It lists listening TCP sockets with numbers and the owning program, so I can see for example nginx on 0.0.0.0:80. I also test from another host with curl or nc.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ss -tlnp</code> shows listeners, ports and owners.</li>
<li>0.0.0.0 means all addresses; 127.0.0.1 means local only.</li>
<li>Static page changes need no reload; configuration changes do.</li>
<li>Test from the client as well as from the server.</li>
</ul></div>
`,hi:`
<p>"Active" service ka reachable hona zaroori nahi. Program aur user ke beech ek <b>port</b> aur ek-do <b>files</b> hoti hain. Is chapter mein aap prove karoge ki nginx kis par sun raha hai, jo page woh serve karta hai use badloge, aur server tatha client dono se test karoge.</p>

<h3>Kaunse port par sun raha hai?</h3>
<p><code>ss</code> sockets dikhata hai. Flags: <code>-t</code> TCP, <code>-l</code> listening, <code>-n</code> naam ki jagah numbers, <code>-p</code> har socket ka malik program (doosre users ke programs dekhne ke liye sudo).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo ss -tlnp</span>
Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port Process
tcp   LISTEN 0      4096     127.0.0.53%lo:53        0.0.0.0:*    users:(("systemd-resolve",pid=402,fd=3))
tcp   LISTEN 0      4096           0.0.0.0:22        0.0.0.0:*    users:(("sshd",pid=701,fd=3))
tcp   LISTEN 0      4096           0.0.0.0:80        0.0.0.0:*    users:(("nginx",pid=700,fd=3))</pre>
<p><b>Local Address:Port</b> column padho. <code>0.0.0.0:80</code> matlab "is server ke har address par port 80", jiska malik nginx hai. <code>127.0.0.53%lo:53</code> jaisi line batati hai ki DNS resolver sirf loopback par sunta hai, isliye doosri machines use nahi kar sakti. Network engineer ke liye yeh "show control-plane host open-ports" ka Linux version hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Request path: client curl port 80 par, nginx, /var/www/html mein index.html file">
<rect x="10" y="50" width="120" height="70" rx="8" fill="#bae6fd"/><text x="70" y="80" text-anchor="middle" class="svg-ink" font-size="12">WS01 curl</text><text x="70" y="98" text-anchor="middle" class="svg-ink" font-size="12">10.99.0.20</text>
<rect x="250" y="50" width="130" height="70" rx="8" fill="#fde68a"/><text x="315" y="80" text-anchor="middle" class="svg-ink" font-size="12">nginx</text><text x="315" y="98" text-anchor="middle" class="svg-ink" font-size="12">:80 par sunta hai</text>
<rect x="500" y="50" width="130" height="70" rx="8" fill="#bbf7d0"/><text x="565" y="80" text-anchor="middle" class="svg-ink" font-size="11">/var/www/html/</text><text x="565" y="98" text-anchor="middle" class="svg-ink" font-size="12">index.html</text>
<line x1="130" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="380" y1="85" x2="500" y2="85" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle port, phir woh file jo nginx wapas deta hai.</p></div>

<h3>Woh kya serve karta hai?</h3>
<p>Default page package ke saath aata hai. <code>curl localhost</code> server se hi fetch karta hai (<code>localhost</code> matlab "yeh machine").</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">curl localhost</span>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
&lt;title&gt;Welcome to nginx!&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
&lt;h1&gt;Welcome to nginx!&lt;/h1&gt;
&lt;p&gt;If you see this page, the nginx web server is successfully installed and working.&lt;/p&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
<p>Woh page <code>/var/www/html/index.html</code> mein hai, jo <b>web root</b> hai. Use ek line ke NOC page se badlo. <code>tee</code> apna input file mein likhta hai, aur <code>sudo tee</code> use protected folder mein likhne deta hai (plain <code>&gt;</code> redirect aapke naam se chalta, root ke naam se nahi, aur fail hota).</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">echo "&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;" | sudo tee /var/www/html/index.html</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;
netadmin@nms02:~$ <span class="hl">curl localhost</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>Reload ki zaroorat nahi padi: nginx static files har request par padhta hai. Sirf <b>configuration</b> changes ko reload chahiye.</p>

<h3>User ki tarah test karo</h3>
<pre class="out">priya@ws01:~$ <span class="hl">curl 10.99.0.20</span>
&lt;h1&gt;Deccan Net NOC - nms02&lt;/h1&gt;</pre>
<p>WS01 se success ek saath chaar cheezein prove karta hai: service up hai, port open hai, server address reachable hai, aur content sahi hai. Client se fail aur <code>localhost</code> se kaam kare to nginx nahi, network ya firewall par shak karo.</p>

<h3>Configuration kahan rehti hai</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">ls /etc/nginx</span>
nginx.conf  sites-available</pre>
<p>Main file <code>/etc/nginx/nginx.conf</code> hai; folder mein per-site files hoti hain. Is lab mein hum sirf folder ka naam padhte hain; nginx edit karna alag course hai.</p>

<h3>Reference (simulator mein nahi chalte)</h3>
<pre class="code">sudo nginx -t          <span class="c"># nginx config syntax check (sshd -t ka nginx jodidaar)</span>
curl -I localhost      <span class="c"># sirf response headers dikhao</span>
curl -v 10.99.0.20     <span class="c"># poori baatcheet dikhao</span></pre>

<div class="eg"><p><b>Worked example.</b> NOC kehta hai status page par galat text hai. Aap <code>sudo ss -tlnp</code> se port confirm karte ho, <code>sudo tee</code> se file badalte ho, <code>curl localhost</code> check karte ho, phir Priya se WS01 se <code>curl 10.99.0.20</code> chalane ko kehte ho. Paanch commands, restart ki zaroorat nahi.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Sirf <code>curl localhost</code> se test karke success declare karna. Page server par chal sakta hai par network par blocked ho sakta hai. Hamesha client se bhi test karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>0.0.0.0:80</code> matlab saare addresses; <code>127.0.0.1:80</code> matlab sirf loopback, isliye remote clients connect nahi kar sakte.</p></div>

<div class="scn"><h4>Server par chalta hai, bahar se mara</h4><p>Ek engineer ka page server par load hua par desks se nahi. <code>ss</code> ne dikhaya service sirf 127.0.0.1 se bandhi thi. Ek setting badalne se woh sab addresses par sunne lagi aur page aa gaya.</p><p><b>Lesson:</b> sirf port nahi, local address column padho.</p></div>

<div class="iv"><p class="q">"Kaunsa process kisi port par sun raha hai yeh kaise check karte ho?"</p><p>Main <code>sudo ss -tlnp</code> chalata hoon. Yeh numbers ke saath listening TCP sockets aur malik program dikhata hai, jaise nginx 0.0.0.0:80 par. Main doosre host se curl ya nc se bhi test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>ss -tlnp</code> listeners, ports aur owners dikhata hai.</li>
<li>0.0.0.0 matlab sab addresses; 127.0.0.1 matlab sirf local.</li>
<li>Static page changes ko reload nahi chahiye; configuration changes ko chahiye.</li>
<li>Server ke saath client se bhi test karo.</li>
</ul></div>
`}};export{e as default};