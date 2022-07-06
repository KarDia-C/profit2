read -p '确认已经提交或暂存更改？(y/N) ' confirm

case $confirm in
    [yY])
        ;;
    *)
        exit
esac

npm run build

cp .gitignore .gitignore.bak
sed -i '/\/dist/d' .gitignore

git add -A
git commit -a -m "update gh-pages"

git push origin `git subtree split --prefix dist master`:gh-pages --force

rm .gitignore
mv .gitignore.bak .gitignore

git reset HEAD^ --hard
