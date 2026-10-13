var e=e=>`<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="tftpd-hpa pieces">
<rect x="10" y="20" width="190" height="110" rx="10" fill="#fde68a"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">/etc/default/tftpd-hpa</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="11">TFTP_USERNAME  tftp</text><text x="105" y="86" text-anchor="middle" class="svg-muted" font-size="11">TFTP_DIRECTORY /srv/tftp</text><text x="105" y="104" text-anchor="middle" class="svg-muted" font-size="11">TFTP_OPTIONS   --secure</text>
<rect x="250" y="35" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="13">in.tftpd</text><text x="320" y="88" text-anchor="middle" class="svg-muted" font-size="11">runs as user tftp</text>
<rect x="440" y="35" width="190" height="80" rx="10" fill="#bbf7d0"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="13">/srv/tftp</text><text x="535" y="88" text-anchor="middle" class="svg-muted" font-size="11">the only folder it serves</text>
<line x1="200" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="390" y1="75" x2="440" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">`+e+`</p></div>`,t=`<pre class="code">netadmin@tftp01:~$ sudo apt update
netadmin@tftp01:~$ sudo apt install -y tftpd-hpa</pre>
<pre class="out">Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  tftpd-hpa
0 upgraded, 1 newly installed, 0 to remove and 3 not upgraded.
...
Setting up tftpd-hpa (5.2+20150808-1.4build1) ...
info: Adding system user <span class="hl">\`tftp'</span> (UID 113) ...
info: Adding new user \`tftp' (UID 113) with group \`nogroup' ...
info: Not creating home directory \`/srv/tftp'.
Created symlink /etc/systemd/system/multi-user.target.wants/tftpd-hpa.service</pre>`,n=`<pre class="code">netadmin@tftp01:~$ systemctl status tftpd-hpa
netadmin@tftp01:~$ cat /etc/default/tftpd-hpa</pre>
<pre class="out">● tftpd-hpa.service - LSB: HPA's tftp server
     Loaded: loaded (/usr/lib/systemd/system/tftpd-hpa.service; enabled; preset: enabled)
     Active: <span class="hl">active (running)</span> since Tue 2026-09-29 09:00:30 IST; 0s ago
   Main PID: 700 (in.tftpd)
     CGroup: /system.slice/tftpd-hpa.service
             └─700 /usr/sbin/in.tftpd --listen --user tftp --address :69 --secure /srv/tftp

# /etc/default/tftpd-hpa

TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/srv/tftp"
TFTP_ADDRESS=":69"
TFTP_OPTIONS="--secure"</pre>`,r=`<pre class="code">netadmin@tftp01:~$ id tftp
netadmin@tftp01:~$ grep tftp /etc/passwd
netadmin@tftp01:~$ ls -ld /srv/tftp</pre>
<pre class="out">uid=113(tftp) gid=113(tftp) groups=113(tftp)
tftp:x:113:113:tftp daemon:/srv/tftp:/usr/sbin/nologin
drwxr-xr-x  2 tftp     tftp       4096 Sep 29 09:00 /srv/tftp</pre>`,i={id:`server-setup`,h:{en:`Building the server: tftpd-hpa, its settings and its user`,hi:`Server banana: tftpd-hpa, uski settings aur uska user`},body:{en:`
<p>A TFTP server is a program (a <b>daemon</b>) that listens on UDP 69 and serves one directory. On Ubuntu the usual choice is <b>tftpd-hpa</b>. Setting it up needs three steps: install the package, understand its settings file, and check that it runs. Think of opening a small shop: you rent the shop (install), you decide which shelf customers may take from (the directory), and you put a clerk with limited keys behind the counter (the user).</p>

<h3>Step 1: install the package</h3>
<p><code>apt</code> is the Ubuntu package manager. <code>apt update</code> refreshes the list of available packages; <code>apt install -y NAME</code> installs one (<code>-y</code> answers yes to the question). Both need <code>sudo</code> because they change the system.</p>
`+t+`
<p>Read the last lines. The installer <b>created a user called tftp</b> (user id 113) with no home directory and no login shell, and it enabled the service so it starts at boot. That user is important: it is the identity the daemon will use. Lines marked <code>...</code> are shortened here; the package download lines contain web addresses.</p>

<h3>Step 2: the settings file</h3>
`+n+`
<p>The service is <b>active (running)</b> and the command line at the bottom shows how the file's settings become options: <code>--user tftp</code>, <code>--address :69</code>, <code>--secure</code>, and the directory <code>/srv/tftp</code> at the end. The file has four settings:</p>
<dl class="terms">
<dt>TFTP_USERNAME</dt><dd>The account the daemon runs as after it starts. A low-privilege user limits the damage if the daemon is attacked.</dd>
<dt>TFTP_DIRECTORY</dt><dd>The only directory served. Clients ask for names inside it.</dd>
<dt>TFTP_ADDRESS</dt><dd><code>:69</code> means every address on UDP port 69. You could bind to one address, for example <code>10.99.0.40:69</code>.</dd>
<dt>TFTP_OPTIONS</dt><dd>Extra flags. <code>--secure</code> makes every file name relative to the directory, so a request such as <code>/etc/shadow</code> cannot escape the folder. We will add <code>--create</code> in the next chapter.</dd>
</dl>
`+e(`The settings file names the user, the folder and the options; the daemon serves only that folder.`)+`

<h3>Step 3: the user and the folder</h3>
<p>Confirm who the daemon is and who owns the folder:</p>
`+r+`
<ul>
<li><code>id tftp</code> prints the user's numbers: the user id (uid), the primary group id (gid) and the groups.</li>
<li>The line from <code>/etc/passwd</code> shows the home <code>/srv/tftp</code> and the shell <code>/usr/sbin/nologin</code>: nobody can log in as tftp. It exists only to run the daemon.</li>
<li><code>ls -ld /srv/tftp</code> (<code>-d</code> shows the folder itself, not its contents): owner <code>tftp</code>, mode <code>drwxr-xr-x</code>. The owner may read, write and enter it; others may only read and enter.</li>
</ul>
<p>This ownership is exactly what lets the daemon write a new backup into the folder. You will see in chapter 5 that it also decides what the daemon <i>cannot</i> read.</p>

<div class="eg"><p><b>Worked example.</b> You want the daemon to serve a separate folder <code>/srv/backups</code>. You would create the folder, make <code>tftp</code> the owner (<code>sudo chown tftp:tftp /srv/backups</code>), change <code>TFTP_DIRECTORY</code> to the new path, and restart with <code>sudo systemctl restart tftpd-hpa</code>. Forgetting the ownership step gives a server that runs perfectly but fails every upload with a permission error.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Editing <code>/etc/default/tftpd-hpa</code> and not restarting the service (the old settings stay active); making the directory world-writable with <code>chmod 777</code> to "make it work"; running the daemon as root. Each of these widens the damage if the server is attacked.</p></div>
<div class="exam"><p><b>Exam trap.</b> The settings of tftpd-hpa live in <code>/etc/default/tftpd-hpa</code>, not in <code>/etc/tftpd.conf</code>. The service name is <code>tftpd-hpa</code>, the program is <code>in.tftpd</code>.</p></div>

<div class="scn"><h4>Active, but serving the wrong folder</h4><p>A new colleague put backups in <code>/var/lib/tftpboot</code>, a path from an old tutorial. Routers kept failing with "file not found". <code>cat /etc/default/tftpd-hpa</code> showed that the daemon served <code>/srv/tftp</code>. Moving the files there fixed it. The service was healthy all the time.</p><p><b>Lesson:</b> read the settings file before blaming the network.</p></div>

<div class="iv"><p class="q">"You installed a TFTP server and routers cannot download files. What do you check first on the server?"</p><p>That the service is active (<code>systemctl status tftpd-hpa</code>), that it listens on UDP 69 (<code>ss -uln</code>), which directory and options it uses (<code>/etc/default/tftpd-hpa</code>), and that the files are inside that directory with permissions the tftp user can read. Then the firewall and the journal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Install with <code>sudo apt install -y tftpd-hpa</code>; the package creates a low-privilege <code>tftp</code> user.</li>
<li>Settings are in <code>/etc/default/tftpd-hpa</code>: user, directory, address, options.</li>
<li><code>--secure</code> confines requests to the served directory.</li>
<li>The daemon can only do what the tftp user is allowed to do on disk.</li>
<li>After any change to the settings, restart the service.</li>
</ul></div>
`,hi:`
<p>TFTP server ek program (<b>daemon</b>) hai jo UDP 69 par sunta hai aur ek directory serve karta hai. Ubuntu par aam choice <b>tftpd-hpa</b> hai. Isse set up karne ke teen steps hain: package install karo, uski settings file samjho, aur check karo ki woh chal raha hai. Socho ek chhoti dukaan kholna: aap dukaan kiraye par lete ho (install), tay karte ho ki customers kaunsi shelf se utha sakte hain (directory), aur counter ke peeche seemit chabiyon wala ek clerk bithate ho (user).</p>

<h3>Step 1: package install karo</h3>
<p><code>apt</code> Ubuntu ka package manager hai. <code>apt update</code> available packages ki list refresh karta hai; <code>apt install -y NAME</code> ek package install karta hai (<code>-y</code> sawaal ka jawab haan deta hai). Dono ko <code>sudo</code> chahiye kyunki woh system badalte hain.</p>
`+t+`
<p>Aakhri lines padho. Installer ne <b>tftp naam ka user banaya</b> (user id 113), bina home directory aur bina login shell ke, aur service enable ki taaki woh boot par start ho. Yeh user zaroori hai: yahi woh pehchan hai jo daemon use karega. <code>...</code> se chhodi gayi lines yahan chhoti ki gayi hain; package download lines mein web addresses hote hain.</p>

<h3>Step 2: settings file</h3>
`+n+`
<p>Service <b>active (running)</b> hai aur neeche ki command line dikhati hai ki file ki settings options kaise banti hain: <code>--user tftp</code>, <code>--address :69</code>, <code>--secure</code>, aur aakhir mein directory <code>/srv/tftp</code>. File mein chaar settings hain:</p>
<dl class="terms">
<dt>TFTP_USERNAME</dt><dd>Woh account jis ki tarah daemon start hone ke baad chalta hai. Low-privilege user daemon par attack hone par nuksaan ko seemit karta hai.</dd>
<dt>TFTP_DIRECTORY</dt><dd>Sirf yahi directory serve hoti hai. Clients uske andar ke naam maangte hain.</dd>
<dt>TFTP_ADDRESS</dt><dd><code>:69</code> ka matlab UDP port 69 par har address. Aap ek address par bind kar sakte ho, jaise <code>10.99.0.40:69</code>.</dd>
<dt>TFTP_OPTIONS</dt><dd>Extra flags. <code>--secure</code> har file naam ko directory ke relative bana deta hai, isliye <code>/etc/shadow</code> jaisa request folder se bahar nahi ja sakta. Agle chapter mein hum <code>--create</code> jodenge.</dd>
</dl>
`+e(`Settings file user, folder aur options batati hai; daemon sirf wahi folder serve karta hai.`)+`

<h3>Step 3: user aur folder</h3>
<p>Confirm karo ki daemon kaun hai aur folder kiska hai:</p>
`+r+`
<ul>
<li><code>id tftp</code> user ke numbers print karta hai: user id (uid), primary group id (gid) aur groups.</li>
<li><code>/etc/passwd</code> ki line home <code>/srv/tftp</code> aur shell <code>/usr/sbin/nologin</code> dikhati hai: koi tftp ban kar login nahi kar sakta. Woh sirf daemon chalane ke liye hai.</li>
<li><code>ls -ld /srv/tftp</code> (<code>-d</code> folder ko khud dikhata hai, uske contents ko nahi): owner <code>tftp</code>, mode <code>drwxr-xr-x</code>. Owner padh, likh aur ghus sakta hai; doosre sirf padh aur ghus sakte hain.</li>
</ul>
<p>Yahi ownership daemon ko folder mein naya backup likhne deti hai. Chapter 5 mein dekhoge ki yahi tay karti hai ki daemon kya <i>nahi</i> padh sakta.</p>

<div class="eg"><p><b>Worked example.</b> Aap chahte ho ki daemon alag folder <code>/srv/backups</code> serve kare. Aap folder banate, <code>tftp</code> ko owner banate (<code>sudo chown tftp:tftp /srv/backups</code>), <code>TFTP_DIRECTORY</code> ko naye path par badalte, aur <code>sudo systemctl restart tftpd-hpa</code> se restart karte. Ownership step bhool jaane se server bilkul theek chalta hai par har upload permission error se fail hota hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> <code>/etc/default/tftpd-hpa</code> edit karke service restart na karna (purani settings active rehti hain); "chalane ke liye" <code>chmod 777</code> se directory ko world-writable bana dena; daemon ko root ki tarah chalana. In sabse server par attack hone par nuksaan badhta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> tftpd-hpa ki settings <code>/etc/default/tftpd-hpa</code> mein hain, <code>/etc/tftpd.conf</code> mein nahi. Service ka naam <code>tftpd-hpa</code> hai, program <code>in.tftpd</code>.</p></div>

<div class="scn"><h4>Active hai, par galat folder serve kar raha hai</h4><p>Ek naye colleague ne purane tutorial ke path <code>/var/lib/tftpboot</code> mein backups rakhe. Routers "file not found" se fail hote rahe. <code>cat /etc/default/tftpd-hpa</code> ne dikhaya ki daemon <code>/srv/tftp</code> serve karta hai. Files wahan le jaane se theek hua. Service poore waqt healthy thi.</p><p><b>Lesson:</b> network ko dosh dene se pehle settings file padho.</p></div>

<div class="iv"><p class="q">"Aapne TFTP server install kiya aur routers files download nahi kar pa rahe. Server par pehle kya check karoge?"</p><p>Ki service active hai (<code>systemctl status tftpd-hpa</code>), ki woh UDP 69 par sun rahi hai (<code>ss -uln</code>), kaunsi directory aur options use karti hai (<code>/etc/default/tftpd-hpa</code>), aur ki files us directory ke andar hain aisi permissions ke saath jo tftp user padh sake. Phir firewall aur journal.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>sudo apt install -y tftpd-hpa</code> se install karo; package low-privilege <code>tftp</code> user banata hai.</li>
<li>Settings <code>/etc/default/tftpd-hpa</code> mein hain: user, directory, address, options.</li>
<li><code>--secure</code> requests ko served directory tak seemit karta hai.</li>
<li>Daemon sirf wahi kar sakta hai jo tftp user ko disk par allowed hai.</li>
<li>Settings mein kisi bhi change ke baad service restart karo.</li>
</ul></div>
`}};export{i as default};