if input('确认已经提交或暂存更改？(y/N) ') != 'y': exit()

import os

os.system('npm run build')

os.rename('.gitignore', '.gitignore.bak')

with open('.gitignore.bak', 'r') as fin:
    with open('.gitignore', 'w') as fout:
        for line in fin:
            if line != '/dist\n':
                fout.write(line)

os.system('git add -A')
os.system('git commit -a -m "update gh-pages"')

os.system('git push origin `git subtree split --prefix dist master`:gh-pages --force') # seems only bash works

os.remove('.gitignore')
os.rename('.gitignore.bak', '.gitignore')

os.system('git reset HEAD^^ --hard')
