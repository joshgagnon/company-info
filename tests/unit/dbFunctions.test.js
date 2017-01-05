import chai from 'chai';
chai.should();
const getDB = require('../../app/db').getDB;
const moment = require('moment');


describe('DB Functions', () => {
    let db;
    before(function (){
        db = getDB()
    });

    describe('company_from_nzbn_at_date', () => {
        it('should find the previous names of "CONSTELLATION HOLDINGS LIMITED"', () => {
            return db.func('company_from_nzbn_at_date', ['9429039824622', moment('06 July 1997', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].company_from_nzbn_at_date.should.equal('SSANGYONG MOTOR DISTRIBUTORS NZ LIMITED');
                });
        });

        it('should find the current name of "CONSTELLATION HOLDINGS LIMITE" on day of name change', () => {
            return db.func('company_from_nzbn_at_date', ['9429039824622', moment('26 May 1999', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].company_from_nzbn_at_date.should.equal('CONSTELLATION HOLDINGS LIMITED');
                });
        });
    });
    
    describe('nzbn_at_date', () => {
        it('should find nzbn for company name at date', () => {
            return db.func('nzbn_at_date', ['SATURN MOTORS LIMITED', moment('06 July 1992', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].nzbn_at_date.should.equal('9429039824622');
                });
        });

        it('should find nzbn for company name at date where date is the date of a name change', () => {
            return db.func('nzbn_at_date', ['SSANGYONG MOTOR DISTRIBUTORS NZ LIMITED', moment('05 July 1996', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].nzbn_at_date.should.equal('9429039824622');
                });
        });
    });
    
    describe('company_name_at_date', () => {
        it('should find company name at 06 July 1992 for given company name at 06 July 1997', () => {
            return db.func('company_name_at_date', ['SSANGYONG MOTOR DISTRIBUTORS NZ LIMITED', moment('06 July 1997', 'DD MMMM YYYY').toDate(),  moment('06 July 1992', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].company_name_at_date.should.equal('SATURN MOTORS LIMITED');
                });
        });

        it('should find company name at 06 July 1992 for given company name at date of a name change', () => {
            return db.func('company_name_at_date', ['CONSTELLATION HOLDINGS LIMITED', moment('26 May 1999', 'DD MMMM YYYY').toDate(),  moment('05 July 1996', 'DD MMMM YYYY').toDate()])
                .then((result) => {
                    result[0].company_name_at_date.should.equal('SSANGYONG MOTOR DISTRIBUTORS NZ LIMITED');
                });
        });
    });
})
