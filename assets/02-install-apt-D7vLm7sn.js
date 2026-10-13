var e={id:`install-apt`,h:{en:`Installing software with apt: update, install, confirm`,hi:`apt se software install karna: update, install, confirm`},body:{en:`
<p>A service must exist before you can control it. On Ubuntu, software comes as <b>packages</b> from online repositories, and the tool that fetches them is <code>apt</code>. In this chapter you install the nginx web server on NMS02, and learn why the first attempt fails.</p>

<h3>Packages and package lists</h3>
<p>A <b>package</b> is a bundle: the program, its default files and instructions for placing them. A <b>repository</b> is a server holding thousands of packages. <code>apt</code> keeps a local <b>list</b> of what the repositories offer. On a fresh server that list can be empty, so apt does not know that nginx exists. The cure is <code>apt update</code>, which refreshes the list (it installs nothing).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="apt update refreshes the list, apt install downloads the package and sets up the service">
<rect x="10" y="40" width="130" height="70" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">Repository</text><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="12">(Ubuntu mirror)</text>
<rect x="250" y="40" width="130" height="70" rx="8" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">Local list</text><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="12">apt update</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">Installed</text><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="12">apt install</text>
<line x1="140" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Update the list first, then install from it.</p></div>

<h3>Step 1: is it already installed?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">apt list --installed | grep nginx</span>
netadmin@nms02:~$</pre>
<p><code>apt list --installed</code> prints every installed package; <code>grep nginx</code> keeps lines containing the word. No output means not installed.</p>

<h3>Step 2: the first attempt fails</h3>
<p>Installing changes the system, so it needs <code>sudo</code> (run as administrator). The first time, sudo asks for your password; typing it shows nothing on screen. In this lab the password is the training one, and the line is shown here as a placeholder.</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo apt install nginx</span>
[sudo] password for netadmin: ********
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
<span class="hl">E: Unable to locate package nginx</span>
(hint: the package lists are empty on this fresh server — run sudo apt update first)</pre>
<p>"Unable to locate package" does not mean nginx does not exist. It means your local list has no entry for it.</p>

<h3>Step 3: update, then install</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo apt update</span>
(Hit and Get lines for the Ubuntu mirrors are omitted here)
Fetched 252 kB in 1s (315 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
3 packages can be upgraded. Run 'apt list --upgradable' to see them.
netadmin@nms02:~$ <span class="hl">sudo apt install nginx</span>
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  nginx
0 upgraded, 1 newly installed, 0 to remove and 3 not upgraded.
Need to get 53 kB of archives.
After this operation, 180 kB of additional disk space will be used.
Do you want to continue? [Y/n] <span class="hl">Y</span>
Setting up nginx (1.24.0-2ubuntu7.1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.
Processing triggers for man-db (2.12.0-4build2) ...</pre>
<p>Read the key lines. "NEW packages will be installed" lists what will change, and <code>Do you want to continue? [Y/n]</code> waits for you; typing <code>Y</code> accepts. The <code>Created symlink ... multi-user.target.wants</code> line is the Ubuntu way of saying "start this service at boot": the package installed <b>and enabled</b> nginx. (The simulator output above is shortened by omitting the download lines.)</p>

<h3>Reference commands (not run in the simulator)</h3>
<pre class="code">apt-cache policy nginx     <span class="c"># installed and candidate version</span>
sudo apt remove nginx      <span class="c"># remove the program, keep config files</span>
sudo apt purge nginx       <span class="c"># remove program and config files</span>
sudo apt upgrade           <span class="c"># install available updates</span></pre>

<div class="eg"><p><b>Worked example.</b> Ticket: "Install a web server on NMS02 for the NOC status page." You check with <code>apt list --installed | grep nginx</code> (nothing), try the install, see "Unable to locate package", run <code>sudo apt update</code>, install again and answer Y. Three minutes, and nginx is already running.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> Running <code>apt update</code> and thinking the software is installed. Update only refreshes the list. Also never add <code>-y</code> blindly on a production host before you have read what apt plans to do.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>apt update</code> refreshes lists; <code>apt upgrade</code> installs newer versions; <code>apt install</code> adds a package.</p></div>

<div class="scn"><h4>Package not found on a new VM</h4><p>A junior engineer reported "Ubuntu does not have nginx" after the error appeared on a freshly built VM. A senior colleague ran <code>sudo apt update</code> and the install worked. The lists had simply never been downloaded.</p><p><b>Lesson:</b> on a new machine, update first.</p></div>

<div class="iv"><p class="q">"What is the difference between apt update and apt upgrade?"</p><p><code>apt update</code> downloads the latest package lists from the repositories and installs nothing. <code>apt upgrade</code> installs newer versions of packages you already have. Installing a new package uses <code>apt install</code>.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>apt needs sudo to change the system.</li>
<li>"Unable to locate package" on a fresh host: run <code>sudo apt update</code>.</li>
<li>Read the plan before answering Y.</li>
<li>On Ubuntu a service package normally starts and enables itself.</li>
</ul></div>
`,hi:`
<p>Service control karne se pehle woh exist karni chahiye. Ubuntu par software online repositories se <b>packages</b> ki shakl mein aata hai, aur unhe laane wala tool <code>apt</code> hai. Is chapter mein aap NMS02 par nginx web server install karoge, aur samjhoge ki pehli koshish kyun fail hoti hai.</p>

<h3>Packages aur package lists</h3>
<p><b>Package</b> ek bundle hai: program, uski default files aur unhe rakhne ke instructions. <b>Repository</b> ek server hai jisme hazaron packages hote hain. <code>apt</code> repositories ki offer ki ek local <b>list</b> rakhta hai. Fresh server par woh list khaali ho sakti hai, isliye apt ko pata hi nahi ki nginx hai. Ilaj <code>apt update</code> hai, jo list refresh karta hai (kuch install nahi karta).</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="apt update list refresh karta hai, apt install package download karke service set up karta hai">
<rect x="10" y="40" width="130" height="70" rx="8" fill="#bae6fd"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">Repository</text><text x="75" y="88" text-anchor="middle" class="svg-ink" font-size="12">(Ubuntu mirror)</text>
<rect x="250" y="40" width="130" height="70" rx="8" fill="#fde68a"/><text x="315" y="70" text-anchor="middle" class="svg-ink" font-size="12">Local list</text><text x="315" y="88" text-anchor="middle" class="svg-ink" font-size="12">apt update</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="560" y="70" text-anchor="middle" class="svg-ink" font-size="12">Installed</text><text x="560" y="88" text-anchor="middle" class="svg-ink" font-size="12">apt install</text>
<line x1="140" y1="75" x2="250" y2="75" stroke="#64748b" stroke-width="2"/><line x1="380" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Pehle list update karo, phir usi se install karo.</p></div>

<h3>Step 1: kya pehle se installed hai?</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">apt list --installed | grep nginx</span>
netadmin@nms02:~$</pre>
<p><code>apt list --installed</code> har installed package print karta hai; <code>grep nginx</code> sirf woh lines rakhta hai jinme yeh shabd ho. Output nahi aaya to installed nahi hai.</p>

<h3>Step 2: pehli koshish fail hoti hai</h3>
<p>Install system badalta hai, isliye <code>sudo</code> (administrator ki tarah chalao) chahiye. Pehli baar sudo password poochta hai; type karte waqt screen par kuch nahi dikhta. Lab mein training password hai, aur yahan line placeholder ki tarah dikhayi gayi hai.</p>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo apt install nginx</span>
[sudo] password for netadmin: ********
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
<span class="hl">E: Unable to locate package nginx</span>
(hint: the package lists are empty on this fresh server — run sudo apt update first)</pre>
<p>"Unable to locate package" ka matlab yeh nahi ki nginx exist nahi karta. Matlab aapki local list mein uski entry nahi hai.</p>

<h3>Step 3: update, phir install</h3>
<pre class="out">netadmin@nms02:~$ <span class="hl">sudo apt update</span>
(Hit and Get lines for the Ubuntu mirrors are omitted here)
Fetched 252 kB in 1s (315 kB/s)
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
3 packages can be upgraded. Run 'apt list --upgradable' to see them.
netadmin@nms02:~$ <span class="hl">sudo apt install nginx</span>
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following NEW packages will be installed:
  nginx
0 upgraded, 1 newly installed, 0 to remove and 3 not upgraded.
Need to get 53 kB of archives.
After this operation, 180 kB of additional disk space will be used.
Do you want to continue? [Y/n] <span class="hl">Y</span>
Setting up nginx (1.24.0-2ubuntu7.1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.
Processing triggers for man-db (2.12.0-4build2) ...</pre>
<p>Key lines padho. "NEW packages will be installed" batata hai kya badlega, aur <code>Do you want to continue? [Y/n]</code> aapka intezaar karta hai; <code>Y</code> type karna accept hai. <code>Created symlink ... multi-user.target.wants</code> line Ubuntu ka tareeka hai kehne ka "yeh service boot par start ho": package ne nginx install <b>aur enable</b> dono kiya. (Upar ka simulator output download lines hataakar chhota kiya gaya hai.)</p>

<h3>Reference commands (simulator mein nahi chalte)</h3>
<pre class="code">apt-cache policy nginx     <span class="c"># installed aur candidate version</span>
sudo apt remove nginx      <span class="c"># program hatao, config files rakho</span>
sudo apt purge nginx       <span class="c"># program aur config files dono hatao</span>
sudo apt upgrade           <span class="c"># available updates install karo</span></pre>

<div class="eg"><p><b>Worked example.</b> Ticket: "NOC status page ke liye NMS02 par web server install karo." Aap <code>apt list --installed | grep nginx</code> se check karte ho (kuch nahi), install try karte ho, "Unable to locate package" dekhte ho, <code>sudo apt update</code> chalate ho, dobara install karke Y dete ho. Teen minute, aur nginx pehle se chal raha hai.</p></div>
<div class="warn"><p><b>Common beginner mistake.</b> <code>apt update</code> chalakar sochna ki software install ho gaya. Update sirf list refresh karta hai. Aur production host par apt kya plan kar raha hai padhe bina andhadhund <code>-y</code> mat lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>apt update</code> lists refresh karta hai; <code>apt upgrade</code> naye versions install karta hai; <code>apt install</code> package jodta hai.</p></div>

<div class="scn"><h4>Nayi VM par package nahi mila</h4><p>Ek junior engineer ne freshly built VM par error dekhkar report kiya "Ubuntu mein nginx nahi hai". Senior colleague ne <code>sudo apt update</code> chalaya aur install ho gaya. Lists kabhi download hi nahi hui thi.</p><p><b>Lesson:</b> nayi machine par pehle update karo.</p></div>

<div class="iv"><p class="q">"apt update aur apt upgrade mein kya fark hai?"</p><p><code>apt update</code> repositories se latest package lists download karta hai aur kuch install nahi karta. <code>apt upgrade</code> un packages ke naye versions install karta hai jo pehle se hain. Naya package jodne ke liye <code>apt install</code> use hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>System badalne ke liye apt ko sudo chahiye.</li>
<li>Fresh host par "Unable to locate package": <code>sudo apt update</code> chalao.</li>
<li>Y kehne se pehle plan padho.</li>
<li>Ubuntu par service package aam taur par khud start aur enable ho jaata hai.</li>
</ul></div>
`}};export{e as default};